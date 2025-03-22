package api

/*
ASCII art generator:
https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=Serve
*/

import (
	"context"
	"fmt"
	"html/template"
	"net/http"
	"sort"

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

	m := map[string]string{
		"google": "Google",
	}
	var keys []string
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	providerIndex := &ProviderIndex{Providers: keys, ProvidersMap: m}

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

	mux.HandleFunc("GET /auth", func(res http.ResponseWriter, req *http.Request) {
		if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
			t, _ := template.New("foo").Parse(userTemplate)
			t.Execute(res, gothUser)
		} else {
			gothic.BeginAuthHandler(res, req)
		}
	})

	mux.HandleFunc("GET /auth/callback", func(res http.ResponseWriter, req *http.Request) {
		if gothUser, err := gothic.CompleteUserAuth(res, req); err == nil {
			req.Cookies()
			t, _ := template.New("foo").Parse(userTemplate)
			t.Execute(res, gothUser)
		} else {
			gothic.BeginAuthHandler(res, req)
		}
	})

	mux.HandleFunc("GET /providers-example", func(res http.ResponseWriter, req *http.Request) {
		t, _ := template.New("foo").Parse(providersTemplate)
		t.Execute(res, providerIndex)
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

type ProviderIndex struct {
	Providers    []string
	ProvidersMap map[string]string
}

var providersTemplate = `{{range $key,$value:=.Providers}}
    <p><a href="/auth?provider={{$value}}">Log in with {{index $.ProvidersMap $value}}</a></p>
{{end}}`

var userTemplate = `
<p><a href="/logout?provider={{.Provider}}">logout</a></p>
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
