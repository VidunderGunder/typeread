package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
	"github.com/rs/cors"
)

type HelloOutput struct {
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

	huma.Get(api, "/hello", func(ctx context.Context, _ *struct{}) (*HelloOutput, error) {
		res := &HelloOutput{}
		res.Body = "Hello, World!"
		return res, nil
	})

	// Register GET /greeting/{name} handler.
	huma.Get(api, "/greeting/{name}", func(ctx context.Context, req *struct {
		Name string `path:"name" maxLength:"30" example:"world" doc:"Name to greet"`
	}) (*GreetingOutput, error) {
		res := &GreetingOutput{}
		res.Body.Message = fmt.Sprintf("Hello, %s!", req.Name)
		return res, nil
	})

	http.ListenAndServe("127.0.0.1:8888", cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "https://typeread.vercel.app/"},
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
