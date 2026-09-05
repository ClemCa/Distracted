package com.clemca.distracted;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String STATE_ATTR = "clemsso_state";
    private static final String VERIFIER_ATTR = "clemsso_code_verifier";
    private static final String USER_ATTR = "clemsso_user";

    private final ClemSsoService service;

    public AuthController(ClemSsoService service) {
        this.service = service;
    }

    private String buildRedirectUri(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String path = request.getContextPath() + "/api/auth/callback";
        if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
            return scheme + "://" + serverName + path;
        }
        return scheme + "://" + serverName + ":" + serverPort + path;
    }

    private String buildFrontendUrl(HttpServletRequest request) {
        String referer = request.getHeader("Referer");
        if (referer != null) {
            try {
                java.net.URI uri = java.net.URI.create(referer);
                return uri.getScheme() + "://" + uri.getHost() + (uri.getPort() != -1 ? ":" + uri.getPort() : "");
            } catch (Exception ignored) {
            }
        }
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
            return scheme + "://" + serverName;
        }
        return scheme + "://" + serverName + ":" + serverPort;
    }

    @GetMapping("/login")
    public ResponseEntity<Void> login(HttpServletRequest request, HttpSession session) {
        String redirectUri = buildRedirectUri(request);
        String state = service.generateState();
        String verifier = service.generateCodeVerifier();
        session.setAttribute(STATE_ATTR, state);
        session.setAttribute(VERIFIER_ATTR, verifier);
        return redirect(service.buildAuthorizeUrl(state, service.generateCodeChallenge(verifier), redirectUri));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam(required = false) String code,
                                         @RequestParam(required = false) String state,
                                         @RequestParam(required = false) String error,
                                         HttpServletRequest request,
                                         HttpSession session) {
        String redirectUri = buildRedirectUri(request);
        String frontendUrl = buildFrontendUrl(request);

        if (error != null) {
            return redirectToFrontend(frontendUrl, "?error=" + error);
        }
        String expectedState = (String) session.getAttribute(STATE_ATTR);
        String verifier = (String) session.getAttribute(VERIFIER_ATTR);
        if (code == null || verifier == null || expectedState == null || !expectedState.equals(state)) {
            return redirectToFrontend(frontendUrl, "?error=invalid_state");
        }
        try {
            Map<String, Object> tokens = service.exchangeCode(code, verifier, redirectUri);
            Object accessToken = tokens.get("access_token");
            if (accessToken == null) {
                return redirectToFrontend(frontendUrl, "?error=token_exchange_failed");
            }
            Map<String, Object> user = service.fetchUserInfo(accessToken.toString());
            session.setAttribute(USER_ATTR, user);
            session.removeAttribute(STATE_ATTR);
            session.removeAttribute(VERIFIER_ATTR);
            return redirectToFrontend(frontendUrl, null);
        } catch (Exception e) {
            return redirectToFrontend(frontendUrl, "?error=token_exchange_failed");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Object> me(HttpSession session) {
        Object user = session.getAttribute(USER_ATTR);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpSession session) {
        String frontendUrl = buildFrontendUrl(request);
        session.invalidate();
        return redirectToFrontend(frontendUrl, null);
    }

    private ResponseEntity<Void> redirectToFrontend(String frontendUrl, String query) {
        return redirect(frontendUrl + (query == null ? "" : query));
    }

    private ResponseEntity<Void> redirect(String url) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
    }
}
