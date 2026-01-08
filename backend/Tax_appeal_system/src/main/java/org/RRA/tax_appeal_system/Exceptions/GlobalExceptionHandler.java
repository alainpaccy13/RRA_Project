package org.RRA.tax_appeal_system.Exceptions;

import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.ClientAuthorizationRequiredException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // general Exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericResponse<String>> handleAll(Exception ex) {
        GenericResponse<String> error = new GenericResponse<>(
                 HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Unexpected server error" ,
                LocalDateTime.now().toString()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(ClientAuthorizationRequiredException.class)
    public ResponseEntity<GenericResponse<String>> handleClientAuthorizationRequired(ClientAuthorizationRequiredException ex) {
        GenericResponse<String> error = new GenericResponse<>(
                HttpStatus.UNAUTHORIZED.value(),
                "OAuth2 authorization required. Please log in with Google.",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler
    public ResponseEntity<String> handleRunTimeException(RuntimeException ex){
        System.out.println(ex.getStackTrace());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(" Something went Wrong " + ex.getMessage() );
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .badRequest()
                .body("Invalid error: " + ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // CUSTOM EXCEPTION

    //Handling Not Found Exception
    @ExceptionHandler(CaseNotFoundException.class)
    public ResponseEntity<GenericResponse<String>> handleCaseNotFound(CaseNotFoundException ex) {
        GenericResponse<String> error =  new GenericResponse<>(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now().toString()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler( UsernameNotFoundException.class)
    public ResponseEntity<GenericResponse<String>> handleUserNotFound(UsernameNotFoundException ex) {
        GenericResponse<String> error =  new GenericResponse<>(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now().toString()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // handling duplicate record Exceptions
    @ExceptionHandler(DuplicateCaseSubmissionException.class)
    public ResponseEntity<GenericResponse<String>> handleDuplicateCaseSubmission(DuplicateCaseSubmissionException ex) {
        GenericResponse<String> error =  new GenericResponse<>(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                LocalDateTime.now().toString()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<GenericResponse<String>> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        GenericResponse<String> error =  new GenericResponse<>(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                LocalDateTime.now().toString()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }


}

