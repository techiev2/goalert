package app

import (
	"net/http"
	"strings"

	"github.com/target/goalert/config"
)

func requestScheme(req *http.Request) (ok bool, scheme string) {
	if req.URL.Scheme != "" {
		return true, req.URL.Scheme
	}

	fwdProto := req.Header.Get("X-Forwarded-Proto")
	if fwdProto != "" {
		return true, fwdProto
	}

	// not a forwarded request, use connection info
	if req.Header.Get("X-Forwarded-For") == "" && req.TLS != nil {
		return true, "https"
	}

	// If we cannot determine the original schema
	// then assume secure if we match a secure URL
	//
	// That way we always set the secure cookie flag
	// instead of redirecting in an infinite loop.
	u := *req.URL
	u.Scheme = "https"
	secStr := u.String()
	u.Scheme = "http"
	insecStr := u.String()
	cfg := config.FromContext(req.Context())
	if len(cfg.Auth.RefererURLs) == 0 {
		if strings.HasPrefix(secStr, cfg.PublicURL()) {
			return false, "https"
		}
		if strings.HasPrefix(insecStr, cfg.PublicURL()) {
			return false, "http" // no secure match
		}
	}
	if len(cfg.Auth.RefererURLs) > 0 {
		if cfg.ValidReferer("-", secStr) {
			return false, "https"
		}
		if cfg.ValidReferer("-", insecStr) {
			return false, "http" // no secure match
		}
	}

	return false, "http"
}

func httpsRedirect(disableRedirect bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			req.URL.Host = req.Host
			var ok bool
			ok, req.URL.Scheme = requestScheme(req)
			cfg := config.FromContext(req.Context())

			// Skip redirect if:
			// - redirects are disabled
			// - we are not positive the client is on HTTP (prevent redirect loop)
			// - the client is not on HTTP
			// - HTTP is an allowed referer
			if disableRedirect || !ok || req.URL.Scheme != "http" || cfg.ValidReferer("", req.URL.String()) {
				next.ServeHTTP(w, req)
				return
			}

			// redirect if we're on HTTP but HTTPS would be valid
			u := *req.URL
			u.Scheme = "https"
			if cfg.ValidReferer("", u.String()) {
				http.Redirect(w, req, u.String(), http.StatusTemporaryRedirect)
				return
			}

			next.ServeHTTP(w, req)
		})
	}
}
