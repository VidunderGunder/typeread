package api

import (
	"context"
	"fmt"
	"net/http"
	"time"
	database "typeread/db"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth/gothic"
	"github.com/rs/cors"
)

type BaseOutput struct {
	Body string
}

type GreetingOutput struct {
	Body struct {
		Message string `json:"message" example:"Hello, world!" doc:"Greeting message"`
	}
}

var mux = http.NewServeMux()
var api = humago.New(mux, huma.DefaultConfig("TypeRead API", "0.0.1"))

// 🔑 Hemmeligheter for signering av tokens
var jwtSecret = []byte("supersecretkey")
var refreshSecret = []byte("superrefreshsecret")

// Genererer JWT (access token)
func generateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Minute * 15).Unix(), // 15 min levetid
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// Genererer Refresh Token
func generateRefreshToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 dager levetid
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(refreshSecret)
}

// Middleware for å beskytte ruter med JWT
func validateJWT(ctx huma.Context, next func(huma.Context)) {
	cookie, err := huma.ReadCookie(ctx, "auth_token")
	if err != nil {
		huma.WriteErr(api, ctx, http.StatusUnauthorized,
			"Unauthorized: No token", fmt.Errorf("error detail"),
		)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		huma.WriteErr(api, ctx, http.StatusUnauthorized,
			"Unauthorized: Invalid token", fmt.Errorf("error detail"),
		)
		return
	}

	ctx = huma.WithValue(ctx, "userId", token.Claims.(jwt.MapClaims)["sub"])

	next(ctx)

}

type MeBody struct {
	Body struct {
		Name string `json:"name"`
	}
}

func Serve() {
	db := database.DatabaseInit()

	/*████╗  ██████╗ ██╗   ██╗████████╗███████╗███████╗
	██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
	██████╔╝██║   ██║██║   ██║   ██║   █████╗  ███████╗
	██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ╚════██║
	██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████║
	╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═════*/

	mux.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		session, err := gothic.Store.Get(req, "_gothic_session")
		fmt.Println(err)
		fmt.Println(session.Values)
	})

	huma.Get(api, "/greeting/{name}", func(ctx context.Context, req *struct {
		Name string `path:"name" maxLength:"30" example:"world" doc:"Name to greet"`
	}) (*GreetingOutput, error) {
		res := &GreetingOutput{}
		res.Body.Message = fmt.Sprintf("Hello, %s!", req.Name)
		return res, nil
	})

	/*████╗ ██╗   ██╗████████╗██╗  ██╗
	██╔══██╗██║   ██║╚══██╔══╝██║  ██║
	███████║██║   ██║   ██║   ███████║
	██╔══██║██║   ██║   ██║   ██╔══██║
	██║  ██║╚██████╔╝   ██║   ██║  ██║
	╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚*/

	// 🔥 Google OAuth callback
	mux.HandleFunc("GET /auth/callback", func(res http.ResponseWriter, req *http.Request) {
		gothUser, err := gothic.CompleteUserAuth(res, req)
		if err != nil {
			fmt.Fprintln(res, err)
			return
		}

		// Lagre bruker i databasen
		db.CreateUser(&database.UserInput{
			FirstName:   gothUser.FirstName,
			LastName:    gothUser.LastName,
			NickName:    gothUser.NickName,
			Description: gothUser.Description,
			AvatarURL:   gothUser.AvatarURL,
			Location:    gothUser.Location,
		}, &database.UserProviderInput{
			UId:               gothUser.UserID,
			Provider:          gothUser.Provider,
			AccessToken:       gothUser.AccessToken,
			AccessTokenSecret: gothUser.AccessTokenSecret,
			RefreshToken:      gothUser.RefreshToken,
			ExpiresAt:         gothUser.ExpiresAt,
			IDToken:           gothUser.IDToken,
		})

		// 🎟️ Generer tokens
		refreshToken, _ := generateRefreshToken(gothUser.UserID)
		// Sett refresh token i HTTP-only cookie
		http.SetCookie(res, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			Expires:  time.Now().Add(time.Minute * 15),
			HttpOnly: true,
			Path:     "/",
		})

		// Redirect til frontend
		http.Redirect(res, req, "http://localhost:3000", http.StatusSeeOther)
	})

	// 🔄 Endpoint for å hente nytt access token
	mux.HandleFunc("POST /auth/refresh", func(res http.ResponseWriter, req *http.Request) {
		cookie, err := req.Cookie("refresh_token")
		if err != nil {
			http.Error(res, "No refresh token", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			return refreshSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(res, "Invalid refresh token", http.StatusUnauthorized)
			return
		}

		claims, _ := token.Claims.(jwt.MapClaims)
		userID := claims["sub"].(string)

		// Generer nytt access token
		newAccessToken, _ := generateJWT(userID)
		newRefreshToken, _ := generateRefreshToken(userID)
		// Sett refresh token i HTTP-only cookie
		http.SetCookie(res, &http.Cookie{
			Name:     "refresh_token",
			Value:    newRefreshToken,
			Expires:  time.Now().Add(time.Minute * 15),
			HttpOnly: true,
			Path:     "/",
		})

		// Send det nye access tokenet til frontend
		res.Header().Set("Content-Type", "application/json")
		res.WriteHeader(http.StatusOK)
		res.Write([]byte(fmt.Sprintf(`{"access_token": "%s"}`, newAccessToken)))
	})

	// 🔐 Beskyttet route

	api.UseMiddleware(validateJWT)
	huma.Register(api, huma.Operation{
		OperationID: "your-operation-name",
		Method:      http.MethodGet,
		Path:        "/me",
		Summary:     "Get user info",
	}, func(ctx context.Context, req *struct{}) (*MeBody, error) {
		userID := ctx.Value("userID") // Hent userID fra kontekst
		if userID == nil {
			return nil, fmt.Errorf("Unauthorized")
		}

		user, err := db.GetUser(userID.(string))
		if err != nil {
			return nil, err
		}
		resp := &MeBody{}
		resp.Body.Name = user.Name
		return resp, nil
	})

	fmt.Println("👂 http://localhost:8888/")
	http.ListenAndServe("127.0.0.1:8888", cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "https://typeread.vercel.app/"},
		AllowCredentials: true,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Accept", "Authorization", "Content-Type", "X-CSRF-Token",
		},
	}).Handler(mux))
}
