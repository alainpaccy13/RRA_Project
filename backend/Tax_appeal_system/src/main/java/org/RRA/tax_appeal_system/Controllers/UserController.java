package org.RRA.tax_appeal_system.Controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.UpdateUserRequest;
import org.RRA.tax_appeal_system.DTOS.responses.GenericResponse;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Services.UserInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = "User")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/v1/")
public class UserController {
    private final UserInfoService userInfoService;

    @Operation(summary = "Updating User")
    @PreAuthorize("hasAnyAuthority('COMMITTEE_LEADER')")
    @PutMapping("/user/{id}")
    public String updateUser(@PathVariable UUID id, @RequestBody UpdateUserRequest updateUser) {
        userInfoService.updateUserInfo(id,updateUser);
        return "User updated";
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<GenericResponse<UserInfo>> getUserById(@PathVariable UUID id) {
        UserInfo userInfo = userInfoService.getUserById(id);
        GenericResponse<UserInfo> response = new GenericResponse<>(200,"OK",userInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/")
    public ResponseEntity<GenericResponse<UserInfo>> getCurrentUser(Principal principal) {
        String username = principal.getName();
        UserInfo user = userInfoService.getUserByEmail(username);
        GenericResponse<UserInfo> response = new GenericResponse<>(200,"OK",user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/user/{id}/availability-status")
    public ResponseEntity<String> updateUserAvailabilityStatus(@PathVariable UUID id,@RequestBody boolean availabilityStatus){
        userInfoService.updateUserAvailabilityStatus(id,availabilityStatus);
        return ResponseEntity.ok("user availability status updated successfully!");
    }


    @PostMapping("/user/generate-proxy")
    public ResponseEntity<GenericResponse<Map<String, String>>> generateProxy(Principal principal) {
        String rawPassword = userInfoService.generateProxyCredentials(principal.getName());

        Map<String, String> result = new HashMap<>();
        result.put("email", principal.getName());
        result.put("temporaryPassword", rawPassword);
        result.put("expiresIn", "24 Hours");

        return ResponseEntity.ok(new GenericResponse<>(200, "Proxy credentials generated", result));
    }

}
