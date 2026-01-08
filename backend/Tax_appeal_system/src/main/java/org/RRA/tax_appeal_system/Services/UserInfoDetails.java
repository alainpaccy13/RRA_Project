package org.RRA.tax_appeal_system.Services;

import org.RRA.tax_appeal_system.Models.UserInfo;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


public class UserInfoDetails implements UserDetails {
    private String username;
    private String password;
    private List<GrantedAuthority> authorities;
    public UserInfoDetails(UserInfo userInfo) {
        this.username = userInfo.getEmail(); // we will use email in place of the user name
        this.password = userInfo.getPassword();
        this.authorities = List.of(new SimpleGrantedAuthority(userInfo.getCommitteeRole().name()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
