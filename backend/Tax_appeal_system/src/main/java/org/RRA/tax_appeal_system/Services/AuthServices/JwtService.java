package org.RRA.tax_appeal_system.Services.AuthServices;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.RRA.tax_appeal_system.Models.RefreshToken;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.RefreshTokenRepository;
import org.RRA.tax_appeal_system.Repositories.UserInfoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Component
@Slf4j
public class JwtService {
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private UserInfoRepo userInfoRepo;

    @Value("${app.jwt.secret}")
    private String JWT_SECRET;
    @Value("${app.jwt.expiration}")
    private long jwtExpirationInMs;
    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationInMs;

    Date now=new Date();

    // generating Access Token
    public String generateAccessToken(String email) { // Use email as username
        Map<String, Object> claims = new HashMap<>();
        return generateToken(email,jwtExpirationInMs,claims);
    }



    //Generating Refresh token
    public String generateRefreshToken(String email) { // Use email as username
        Map<String, String> claims = new HashMap<>();
        claims.put("tokenType", "refresh_token");
        String refreshTokenString = generateToken(email, refreshExpirationInMs, claims);
        UserInfo userInfo = userInfoRepo.findByEmail(email).orElse(null);

        // Check if a refresh token already exists for this user
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserInfo(userInfo);

        RefreshToken refreshToken;
        if (existingToken.isPresent()) {

            //updating the existing token
            refreshToken = existingToken.get();
            refreshToken.setToken(refreshTokenString);
            refreshToken.setExpiryDate(new Date(now.getTime() + jwtExpirationInMs));
        } else {
            //create a new Token
            refreshToken = RefreshToken.builder()
                    .userInfo(userInfo)
                    .token(refreshTokenString)
                    // Note: Use the dedicated refreshExpirationInMs property
                    .expiryDate(new Date(now.getTime() + refreshExpirationInMs))
                    .build();


        }
        refreshTokenRepository.save(refreshToken);
        return refreshTokenString;
    }

    // Method to find the stored token by its string value
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    // Method to verify if the stored refresh token is expired
    public void verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new sign-in request");
        }
    }
    // Token generation
    private String generateToken(String email,long expirationInMs,Map<String,?> claims) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime()+expirationInMs)) // our token will last for 60 minutes
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(JWT_SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                // Use verifyWith() or parserWith() - Both are valid in 0.12.5
                .verifyWith((SecretKey) getSignKey())
                .build()
                .parseSignedClaims(token) // Use parseSignedClaims for claims
                .getPayload();
    }


    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(now);
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        if (username.equals(userDetails.getUsername()) && !isTokenExpired(token)){
            try {
                Jwts.parser().verifyWith((SecretKey) getSignKey()).build().parseSignedClaims(token);
                return true;
            }catch (SignatureException e){
                log.error("Invalid JWT signature", e.getMessage());
            }catch (MalformedJwtException e){
                log.error("Invalid JWT token", e.getMessage());
            }catch (ExpiredJwtException e){
                log.error("JWT token is expired", e.getMessage());
            }catch (UnsupportedJwtException e){
                log.error("JWT token is unsupported", e.getMessage());
            }catch (IllegalArgumentException e){
                log.error("JWT claims string is empty", e.getMessage());
            }
        }
        return false;
    };

    //  Validate if the token is refresh token
    public boolean isRefreshTokenValid(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((SecretKey) getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return "refresh_token".equals(claims.getSubject());
    }
}
