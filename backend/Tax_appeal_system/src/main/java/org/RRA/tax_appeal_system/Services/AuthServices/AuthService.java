package org.RRA.tax_appeal_system.Services.AuthServices;

import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.LoginRequest;
import org.RRA.tax_appeal_system.DTOS.requests.RegisterUser;
import org.RRA.tax_appeal_system.DTOS.responses.AuthResponse;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Exceptions.UserAlreadyExistsException;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.RefreshTokenRepository;
import org.RRA.tax_appeal_system.Repositories.UserInfoRepo;
import org.RRA.tax_appeal_system.Services.UserInfoDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserInfoRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public boolean userExists(String email,String phoneNumber) {
        return userRepo.existsByEmail(email) || userRepo.existsByPhoneNumber(phoneNumber);
    }

    @Transactional
    public UserInfo registerUser(RegisterUser userinfo) {

        //check whether the user exists

        if (userExists(userinfo.email(), userinfo.phoneNumber())) {
            throw new UserAlreadyExistsException("user with " + userinfo.email() + " and " + userinfo
                    .phoneNumber() + " already exists !");
        }

        // User registration
        UserInfo user = UserInfo.builder()
                .fullName(userinfo.fullName())
                .email(userinfo.email())
                .title(userinfo.title())
                .committeeGroup(userinfo.committeeGroup())
                .phoneNumber(userinfo.phoneNumber())
                .password(passwordEncoder.encode(userinfo.password()))
                .committeeRole(userinfo.committeeRole())
                .availabilityStatus(true)
                .build();

        // saving the user
        UserInfo savedUser = userRepo.save(user);
        System.out.println("User saved successfully");

        return savedUser;
    }


    public AuthResponse login(LoginRequest request) {
        UserInfo user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean isAuthenticated = false;
        boolean isProxySession = false; // <--- Track if it's a proxy login

        try {
            // 1. Try Standard Login
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            isAuthenticated = true;
        } catch (BadCredentialsException e) {
            // 2. If Standard Login fails, CHECK PROXY CREDENTIALS
            if (user.getProxyPassword() != null &&
                    user.getProxyPasswordExpiry() != null &&
                    user.getProxyPasswordExpiry().isAfter(LocalDateTime.now())) {

                if (passwordEncoder.matches(request.getPassword(), user.getProxyPassword())) {
                    isAuthenticated = true;
                    isProxySession = true; // <--- Mark as proxy
                }
            }
        }

        if (!isAuthenticated) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getCommitteeRole().toString(),
                accessToken,
                refreshToken,
                isProxySession // <--- Pass the flag here
        );
    }

    @Transactional
    public ResponseEntity<GenericResponse<String>> logout(String userEmail) {
        try {

            // 1. Retrieve the UserInfo object
            System.out.println(" finding user with " + userEmail);
            UserInfo userInfo = userRepo.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found for logout"));


            // 2. Delete the refresh token from the database
            // Convert UUID to String for the repository method
            refreshTokenRepository.deleteByUserInfo(userInfo);

            // 3. Clear the Security Context
            SecurityContextHolder.clearContext();

            // 4. Return consistent response
            GenericResponse<String> response = new GenericResponse<>(
                    200,
                    "Logout successful.",
                    null
            );

            return ResponseEntity.ok(response);

        } catch (UsernameNotFoundException e) {
            GenericResponse<String> errorResponse = new GenericResponse<>(
                    404,
                    e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            GenericResponse<String> errorResponse = new GenericResponse<>(
                    500,
                    "Logout failed",
                    null
            );
            System.out.println("ERROR: [ " + e.getMessage() + " ]");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {

        return jwtService.findByToken(refreshToken)
                .map(token -> {
                    jwtService.verifyExpiration(token); // Check if expired

                    // Generate new Access Token
                    String newAccessToken = jwtService.generateAccessToken(token.getUserInfo().getEmail());
                    // Generate and save a new Refresh Token
                    String newRefreshToken = jwtService.generateRefreshToken(token.getUserInfo().getEmail());

                    // Return new tokens and user details
                    return new AuthResponse(
                            token.getUserInfo().getId(),
                            token.getUserInfo().getFullName(),
                            token.getUserInfo().getEmail(),
                            token.getUserInfo().getCommitteeRole().toString(),
                            newAccessToken,
                            newRefreshToken,
                            false // <--- Added 'false' for isProxy (refresh doesn't change session type)
                    );
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

}
