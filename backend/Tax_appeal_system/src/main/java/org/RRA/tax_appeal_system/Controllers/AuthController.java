package org.RRA.tax_appeal_system.Controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.TokenRefreshRequest;
import org.RRA.tax_appeal_system.DTOS.responses.AuthResponse;
import org.RRA.tax_appeal_system.DTOS.requests.LoginRequest;
import org.RRA.tax_appeal_system.DTOS.requests.RegisterUser;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Services.AuthServices.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth/")
@RequiredArgsConstructor
@Tag(name = " Authentication ")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserInfo> registerUser(@RequestBody RegisterUser user) {
        UserInfo user1 = authService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user1);
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // MODIFIED SECTION: Changed from @PathVariable to @RequestBody
    @PostMapping("/refresh-token")
    public AuthResponse refreshToken(@RequestBody TokenRefreshRequest refreshTokenRequest) {
        // Extract the token from the request body and pass it to the service
        return authService.refreshToken(refreshTokenRequest.refreshToken());
    }


    // Note: To use this in a controller, you can extract the email from the
    // Access Token of the current request via the SecurityContextHolder:

    @PostMapping("/logout")
    public ResponseEntity<GenericResponse<String>> logout(Principal principal) {
        String userEmail = principal.getName();

        return authService.logout(userEmail);
    }

}