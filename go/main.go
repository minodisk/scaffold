package main

import (
	"log"
	"os"
	"strconv"
)

func main() {
	err := _main()
	if err != nil {
		log.Fatalln(err)
	}
}

func _main() (err error) {
	var port int
	p := os.Getenv("API_PORT")
	if p == "" {
		port = 80
	} else {
		port, err = strconv.Atoi(p)
		if err != nil {
			return
		}
	}
	err = Run(port)
	return
}
