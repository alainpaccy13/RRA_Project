package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Enums.CommitteeGroup;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInfoRepo extends JpaRepository<UserInfo, UUID> {
    Optional<UserInfo> findByEmail(String email);
    Optional<UserInfo> findById(UUID id);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    List<UserInfo> findAllByCommitteeGroup(CommitteeGroup committeeGroup);

    List<UserInfo> findAllByCommitteeGroupAndAvailabilityStatus(CommitteeGroup committeeGroup, Boolean availabilityStatus);

    int countAllByCommitteeGroup(CommitteeGroup committeeGroup);

    int countByAvailabilityStatus(Boolean availabilityStatus);
    int countByCommitteeGroupAndAvailabilityStatus(CommitteeGroup committeeGroup, Boolean availabilityStatus);

    List<UserInfo> findByCommitteeGroup(CommitteeGroup committeeGroup);
}
