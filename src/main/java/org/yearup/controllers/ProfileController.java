package org.yearup.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.ProfileDao;
import org.yearup.data.UserDao;
import org.yearup.models.Profile;
import org.yearup.models.User;

import java.security.Principal;

@RestController
@RequestMapping("/profile")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileDao profileDao;
    private final UserDao userDao;

    public ProfileController(ProfileDao profileDao, UserDao userDao) {
        this.profileDao = profileDao;
        this.userDao = userDao;
    }

    @GetMapping("")
    public Profile getProfile(Principal principal) {
        try {
            String username = principal.getName();
            User user = userDao.getByUserName(username);
            if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

            Profile profile = profileDao.getByUserId(user.getId());
            if (profile == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            return profile;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    @PutMapping("")
    public Profile updateProfile(Principal principal, @RequestBody Profile incoming) {
        try {
            String username = principal.getName();
            User user = userDao.getByUserName(username);
            if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

            incoming.setUserId(user.getId());
            return profileDao.update(incoming);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }
}
