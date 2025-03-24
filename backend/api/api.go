package api

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
	database "typeread/db"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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
var db = database.DatabaseInit()

// 🔑 Hemmeligheter for signering av tokens
var jwtSecret = []byte("supersecretkey")
var refreshSecret = []byte("superrefreshsecret")

// Genererer JWT (access token)
func generateJWT(userID int) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Minute * 15).Unix(), // 15 min levetid
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// Genererer Refresh Token
func generateRefreshToken(userID int) (string, error) {
	jti := uuid.New().String()                // Generer unikt ID
	exp := time.Now().Add(time.Hour * 24 * 7) // 7 dager levetid
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": exp.Unix(),
		"jti": jti,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(refreshSecret)
	if err != nil {
		return "", err
	}

	// Lagre jti i databasen for revokering
	err = db.StoreRefreshToken(userID, jti, exp)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

// Middleware for å beskytte ruter med JWT
func validateJWT(authHeader string) (int, error) {
	var tokenString string
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenString = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		return 0, huma.Error401Unauthorized("Unauthorized: No token")

	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return 0, huma.Error401Unauthorized(fmt.Sprintf("Unauthorized: %v", err))
	}
	if !token.Valid {
		return 0, huma.Error401Unauthorized("Unauthorized: Token is not valid")
	}

	return int(token.Claims.(jwt.MapClaims)["sub"].(float64)), nil
}

// Middleware for å beskytte ruter med JWT
func validateJWTMiddleware(ctx huma.Context, next func(huma.Context)) {
	header := ctx.Header("Authorization")
	userID, err := validateJWT(header)
	if err != nil {
		huma.WriteErr(api, ctx, http.StatusUnauthorized, err.Error(), err)
		return
	}
	newCtx := huma.WithValue(ctx, "userID", userID)

	next(newCtx)

}

type Me struct {
	Body struct {
		ID          uint   `json:"id" validate:"optional"`
		Email       string `json:"email"`
		Name        string `json:"name"`
		FirstName   string
		LastName    string
		NickName    string
		Description string
		AvatarURL   string
		Location    string
	}
}

type AuthParam struct {
	Authorization string `header:"Authorization"`
}

type CookieParam struct {
	Cookie http.Cookie `cookie:"refresh_token"`
}

type RefreshTokenOutput struct {
	Body struct {
		AccessToken string `json:"access_token"`
	}
	Cookie http.Cookie `cookie:"refresh_token"`
}

func Serve() {

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
		userId := db.UpsertUser(gothUser)

		// 🎟️ Generer tokens
		refreshToken, _ := generateRefreshToken(userId)
		// Sett refresh token i HTTP-only cookie
		http.SetCookie(res, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			Expires:  time.Now().Add(time.Hour * 24 * 7),
			HttpOnly: true,
			Path:     "/",
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		})

		// Redirect til frontend
		http.Redirect(res, req, "http://localhost:5173", http.StatusSeeOther)
	})

	mux.HandleFunc("GET /auth", func(res http.ResponseWriter, req *http.Request) {
		gothic.BeginAuthHandler(res, req)
	})

	huma.Register(api, huma.Operation{
		OperationID: "refresh-token",
		Method:      http.MethodPost,
		Path:        "/auth/refresh",
		Summary:     "Refresh Access Token",
	}, func(ctx context.Context, input *struct {
		CookieParam
	}) (*RefreshTokenOutput, error) {

		cookie := input.Cookie
		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, huma.Error401Unauthorized("Invalid signing method")
			}
			return refreshSecret, nil
		})

		if err != nil || !token.Valid {
			return nil, huma.Error401Unauthorized("Invalid refresh token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, huma.Error401Unauthorized("Invalid token claims")
		}

		userID, ok := claims["sub"].(float64)
		if !ok {
			return nil, huma.Error401Unauthorized("Invalid user ID")
		}

		var id int = int(userID)

		jti, ok := claims["jti"].(string)
		if !ok {
			return nil, huma.Error401Unauthorized("Invalid token ID")
		}

		// 🚨 Sjekk at jti eksisterer i databasen!
		if !db.IsRefreshTokenValid(jti) {
			return nil, huma.Error401Unauthorized("Invalid refresh token")
		}

		// ❌ Fjern det gamle refresh-tokenet fra databasen (bruk refresh-token-rotasjon)
		db.RevokeRefreshToken(id)

		// 🔄 Generer nytt access og refresh token
		newAccessToken, _ := generateJWT(id)
		newRefreshToken, _ := generateRefreshToken(id)

		resp := &RefreshTokenOutput{
			Cookie: http.Cookie{
				Name:     "refresh_token",
				Value:    newRefreshToken,
				Expires:  time.Now().Add(time.Hour * 24 * 7),
				HttpOnly: true,
				Path:     "/",
			},
			Body: struct {
				AccessToken string `json:"access_token"`
			}{
				AccessToken: newAccessToken,
			},
		}

		return resp, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "logout",
		Method:      http.MethodPost,
		Path:        "/logout",
		Summary:     "Logout",
	}, func(ctx context.Context, input *struct {
		AuthParam
	}) (*BaseOutput, error) {

		userID, err := validateJWT(input.Authorization)
		if err != nil {
			return &BaseOutput{Body: "Is logg out"}, nil
		}
		db.RevokeRefreshToken(userID)

		return &BaseOutput{Body: "Logged out"}, nil
	})

	/*████╗  ██████╗ ██╗   ██╗████████╗███████╗███████╗
	██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
	██████╔╝██║   ██║██║   ██║   ██║   █████╗  ███████╗
	██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ╚════██║
	██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████║
	╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═════*/

	huma.Get(api, "/greeting/{name}", func(ctx context.Context, req *struct {
		Name string `path:"name" maxLength:"30" example:"world" doc:"Name to greet"`
	}) (*GreetingOutput, error) {
		res := &GreetingOutput{}
		res.Body.Message = fmt.Sprintf("Hello, %s!", req.Name)
		return res, nil
	})

	// Register the handler after UseMiddleware() for the middleware to take effect
	api.UseMiddleware(validateJWTMiddleware)
	huma.Register(api, huma.Operation{
		OperationID: "your-operation-name",
		Method:      http.MethodGet,
		Path:        "/me",
		Summary:     "Get user info",
	}, func(ctx context.Context, req *struct{}) (*Me, error) {
		userID := ctx.Value("userID").(int)
		if userID == 0 {
			return nil, fmt.Errorf("Unauthorized")
		}
		user, err := db.GetUser(userID)

		if err != nil {
			return nil, err
		}
		resp := &Me{}
		resp.Body.ID = user.ID
		resp.Body.Email = user.Email
		resp.Body.Name = user.Name
		resp.Body.FirstName = user.FirstName
		resp.Body.LastName = user.LastName
		resp.Body.NickName = user.NickName
		resp.Body.Description = user.Description
		resp.Body.AvatarURL = user.AvatarURL
		resp.Body.Location = user.Location

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
			"Accept", "Authorization", "Content-Type",
		},
	}).Handler(mux))
}
