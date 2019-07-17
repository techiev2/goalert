package app

import (
	"context"
	"net/http"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/target/goalert/config"
)

func TestRequestScheme(t *testing.T) {
	check := func(name string, isOK bool, expectedScheme string, req *http.Request, cfg *config.Config) {
		t.Run(name, func(t *testing.T) {
			var reqCfg config.Config
			if cfg != nil {
				reqCfg = *cfg
			}
			if req == nil {
				req = &http.Request{}
			}
			if req.Header == nil {
				req.Header = http.Header{}
			}
			if req.URL == nil {
				req.URL = &url.URL{Host: "example.com"}
			}
			req = req.WithContext(reqCfg.Context(context.Background()))
			ok, scheme := requestScheme(req)
			assert.Equal(t, expectedScheme, scheme)
			assert.Equal(t, isOK, ok)
		})
	}

	// X-Forwarded-Proto always takes precedence
	check("use-forwarded-proto-http", true, "http", &http.Request{Header: http.Header{
		"X-Forwarded-Proto": {"http"},
	}}, nil)
	check("use-forwarded-proto-https", true, "https", &http.Request{Header: http.Header{
		"X-Forwarded-Proto": {"https"},
	}}, nil)
	check("use-first-forwarded-proto", true, "https", &http.Request{Header: http.Header{
		"X-Forwarded-Proto": {"https", "http"},
	}}, nil)

	// unknown domain, no pub url match, assume insecure
	check("blank-config-unknown-req", false, "http", nil, nil)
	cfg := &config.Config{}

	// https matches, not http, assume secure
	cfg.General.PublicURL = "https://example.com"
	check("pub-url-https-no-auth", false, "https", nil, cfg)

	// no matches, assume insecure
	cfg.General.PublicURL = "https://not-example.com"
	check("pub-url-https-no-auth-no-match", false, "http", nil, cfg)

	// auth referer matches https, not http, assume secure
	cfg.Auth.RefererURLs = []string{"https//example.com"}
	check("no-pub-match-auth-https", false, "https", nil, cfg)

	// auth referer matches both http and https, assume secure
	cfg.Auth.RefererURLs = []string{"https://example.com", "http://example.com"}
	check("no-pub-match-auth-both", false, "https", nil, cfg)

}
