package org.RRA.tax_appeal_system.Repositories;

import org.RRA.tax_appeal_system.Models.RefreshToken;
import org.RRA.tax_appeal_system.Models.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    void deleteByUserInfo(UserInfo userInfo);

    Optional<RefreshToken> findByUserInfo(UserInfo userInfo);
}
