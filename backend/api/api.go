package api

/*
ASCII art generator:
https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Serve
*/

import (
	"context"
	"fmt"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/markbates/goth/gothic"
	"github.com/rs/cors"

	_ "github.com/danielgtaylor/huma/v2/formats/cbor"
)

type BaseOutput struct {
	Body string
}

type GreetingOutput struct {
	Body struct {
		Message string `json:"message" example:"Hello, world!" doc:"Greeting message"`
	}
}

func Serve() {
	mux := http.NewServeMux()
	api := humago.New(mux, huma.DefaultConfig("TypeRead API", "0.0.1"))

	/*████╗  ██████╗ ██╗   ██╗████████╗███████╗███████╗
	██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
	██████╔╝██║   ██║██║   ██║   ██║   █████╗  ███████╗
	██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ╚════██║
	██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████║
	╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═════*/

	huma.Get(api, "/hello", func(ctx context.Context, _ *struct{}) (*BaseOutput, error) {
		res := &BaseOutput{}
		res.Body = "Hello, World!"
		return res, nil
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

	mux.HandleFunc("GET /login", func(res http.ResponseWriter, req *http.Request) {
		provider := req.URL.Query().Get("provider")
		if provider == "" {
			http.Error(res, "missing provider", http.StatusBadRequest)
			return
		}
		gothic.BeginAuthHandler(res, req)
	})

	mux.HandleFunc("GET /logout", func(res http.ResponseWriter, req *http.Request) {
		gothic.Logout(res, req)
		res.Header().Set("Location", "http://localhost:5173")
		res.WriteHeader(http.StatusTemporaryRedirect)
	})

	/*█████╗███████╗██████╗ ██╗   ██╗███████╗
	██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝
	███████╗█████╗  ██████╔╝██║   ██║█████╗
	╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝
	███████║███████╗██║  ██║ ╚████╔╝ ███████╗
	╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═════*/

	fmt.Println("👂 http://localhost:8888/")
	fmt.Println("📚 http://localhost:8888/docs")
	fmt.Println("🔑 http://localhost:8888/providers-example")
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
