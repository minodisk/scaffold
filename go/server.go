package main

import (
	"fmt"
	"net/http"
)

func Run(port int) (err error) {
	fmt.Printf("[api] listening port on %d", port)
	http.HandleFunc("/", handler)
	return http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("[api] incoming")
	fmt.Fprint(w, "api server is running")
}
