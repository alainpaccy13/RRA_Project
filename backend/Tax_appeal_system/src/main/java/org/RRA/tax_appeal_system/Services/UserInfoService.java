package org.RRA.tax_appeal_system.Services;

import lombok.RequiredArgsConstructor;
import org.RRA.tax_appeal_system.DTOS.requests.UpdateUserRequest;
import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Enums.Privilege;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.RRA.tax_appeal_system.Repositories.UserInfoRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class UserInfoService {
    private final UserInfoRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public boolean doesUserExist(UUID userId) {
        return userRepo.existsById(userId);
    }

    public List<UserInfo> getUsersByCommitteeGroup(CommitteeGroup committeeGroup) {
        List<UserInfo> users = userRepo.findAllByCommitteeGroup(committeeGroup);
    return users;
    }

    public UserInfo getUserById(UUID userId) {
        return userRepo.findById(userId).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserInfo getUserByEmail(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public UserInfo updateUserInfo(UUID id, UpdateUserRequest userInfo) throws UsernameNotFoundException {

            UserInfo user = userRepo.findById(id).orElseThrow(()->new IllegalArgumentException("User with "+ id +" not found"));

            // updating user
            //checking whether the names are not empty
            if (userInfo.fullName() != null && !userInfo.fullName().trim().isEmpty()) {
                user.setFullName(userInfo.fullName());
            };

            //checkin whether the email is not empty
            if(userInfo.email() != null && !userInfo.email().trim().isEmpty()) {
                user.setEmail(userInfo.email());
            }

            user.setCommitteeRole(userInfo.committee_role());
            user.setTitle(userInfo.title());

            //checking whether committee group is not empty
            if (userInfo.committeeGroup() != null && !userInfo.committeeGroup().toString().trim().isEmpty()) {
                user.setCommitteeGroup(userInfo.committeeGroup());
            }
            //checking that phone number is not empty
            user.setPhoneNumber(userInfo.phoneNumber());

            userRepo.save(user);

            System.out.println("User Updated successfully");

            return user;
        }

    @Transactional
    public void updateUserAvailabilityStatus(UUID id,boolean newAvailabilityStatus){
        // first check whether the user exists
        UserInfo user = userRepo.findById(id).orElseThrow(()->new IllegalArgumentException("User not found"));

        //then update the user Availability Statu
        user.setAvailabilityStatus(newAvailabilityStatus);
    }

    // dto/MemberAvailabilityDTO.java
    public record MemberAvailabilityDTO(
            UUID id,
            String fullName,
            String title,
            String committeeRole,
            boolean availabilityStatus
    ) {}

    // In your UserInfoService or CommitteeService
    @Transactional(readOnly = true)
    public List<MemberAvailabilityDTO> getAllMemberAndTheirAvailabilityStatus(String leaderEmail) {
        UserInfo leader = userRepo.findByEmail(leaderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Leader not found"));

        if (leader.getCommitteeRole() != Privilege.COMMITTEE_LEADER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMMITTEE_LEADER can access this feature");
        }

        CommitteeGroup group = leader.getCommitteeGroup();

        return userRepo.findByCommitteeGroup(group).stream()
                .map(user -> new MemberAvailabilityDTO(
                        user.getId(),
                        user.getFullName(),
                        user.getTitle() != null ? user.getTitle() : "",
                        user.getCommitteeRole().name(),
                        user.isAvailabilityStatus()
                ))
                .sorted((a, b) -> a.fullName().compareToIgnoreCase(b.fullName())) // optional: sort by name
                .toList();
    }

    @Transactional
    public void updateMemberAvailabilityAsLeader(String leaderEmail, UUID targetUserId, boolean newStatus) {
        UserInfo leader = userRepo.findByEmail(leaderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Leader not found"));

        if (leader.getCommitteeRole() != Privilege.COMMITTEE_LEADER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        UserInfo targetUser = userRepo.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!targetUser.getCommitteeGroup().equals(leader.getCommitteeGroup())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update user from another committee");
        }

        // Reuse your existing method!
        updateUserAvailabilityStatus(targetUserId, newStatus);
    }

    @Transactional
    public String generateProxyCredentials(String email) {
        UserInfo user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 1. Generate a short random password (e.g., 8 chars)
        String rawProxyPassword = UUID.randomUUID().toString().substring(0, 8);

        // 2. Hash it
        user.setProxyPassword(passwordEncoder.encode(rawProxyPassword));

        // 3. Set expiry to 24 hours from now
        user.setProxyPasswordExpiry(LocalDateTime.now().plusDays(1));

        userRepo.save(user);

        // 4. Return RAW password to show to the user ONE TIME
        return rawProxyPassword;
    }
}
