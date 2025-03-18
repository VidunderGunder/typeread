package api

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"text/template"

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

	//	ooooooooo.                             .
	//	`888   `Y88.                         .o8
	//	 888   .d88'  .ooooo.  oooo  oooo  .o888oo  .ooooo.   .oooo.o
	//	 888ooo88P'  d88' `88b `888  `888    888   d88' `88b d88(  "8
	//	 888`88b.    888   888  888   888    888   888ooo888 `"Y88b.
	//	 888  `88b.  888   888  888   888    888 . 888    .o o.  )88b
	//	o888o  o888o `Y8bod8P'  `V88V"V8P'   "888" `Y8bod8P' 8""888P'

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

	//       .o.                       .   oooo
	//      .888.                    .o8   `888
	//     .8"888.     oooo  oooo  .o888oo  888 .oo.
	//    .8' `888.    `888  `888    888    888P"Y88b
	//   .88ooo8888.    888   888    888    888   888
	//  .8'     `888.   888   888    888 .  888   888
	// o88o     o8888o  `V88V"V8P'   "888" o888o o888o

	m := map[string]string{
		"google": "Google",
	}
	var keys []string
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	providerIndex := &ProviderIndex{Providers: keys, ProvidersMap: m}

	mux.HandleFunc("GET /auth/{provider}/callback", func(res http.ResponseWriter, req *http.Request) {
		user, err := gothic.CompleteUserAuth(res, req)
		if err != nil {
			fmt.Fprintln(res, err)
			return
		}
		t, _ := template.New("foo").Parse(userTemplate)
		t.Execute(res, user)
	})

	mux.HandleFunc("GET /auth/{provider}", func(res http.ResponseWriter, req *http.Request) {
		if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
			t, _ := template.New("foo").Parse(userTemplate)
			t.Execute(res, gothUser)
		} else {
			gothic.BeginAuthHandler(res, req)
		}
	})

	mux.HandleFunc("GET /providers", func(res http.ResponseWriter, req *http.Request) {
		t, _ := template.New("foo").Parse(providersTemplate)
		t.Execute(res, providerIndex)
	})

	//  .oooooo..o
	// d8P'    `Y8
	// Y88bo.       .ooooo.  oooo d8b oooo    ooo  .ooooo.
	//  `"Y8888o.  d88' `88b `888""8P  `88.  .8'  d88' `88b
	//      `"Y88b 888ooo888  888       `88..8'   888ooo888
	// oo     .d8P 888    .o  888        `888'    888    .o
	// 8""88888P'  `Y8bod8P' d888b        `8'     `Y8bod8P'

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

type ProviderIndex struct {
	Providers    []string
	ProvidersMap map[string]string
}

var providersTemplate = `{{range $key,$value:=.Providers}}
    <p><a href="/auth/{{$value}}">Log in with {{index $.ProvidersMap $value}}</a></p>
{{end}}`

var userTemplate = `
<p><a href="/logout/{{.Provider}}">logout</a></p>
<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
<p>Email: {{.Email}}</p>
<p>NickName: {{.NickName}}</p>
<p>Location: {{.Location}}</p>
<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
<p>Description: {{.Description}}</p>
<p>UserID: {{.UserID}}</p>
<p>AccessToken: {{.AccessToken}}</p>
<p>ExpiresAt: {{.ExpiresAt}}</p>
<p>RefreshToken: {{.RefreshToken}}</p>
`
