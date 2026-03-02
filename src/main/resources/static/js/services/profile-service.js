let profileService;

class ProfileService
{
    loadProfile()
    {
        const url = `${config.baseUrl}/profile`;

        axios.get(url, { headers: userService.getHeaders() })
             .then(response => {
                 const data = response.data || {};
                 const merged = Object.assign({
                     username: userService.getUserName(),
                 }, data);

                 templateBuilder.build("profile", merged, "main")
                 const mainEl = document.querySelector('main');
                 if (mainEl) mainEl.classList.add('no-sidebar');

                 // set initials if no avatar
                 const initialsEl = document.getElementById('avatarInitials');
                 const avatarEl = document.getElementById('avatarPreview');
                 if (initialsEl) {
                     const first = merged.firstName || '';
                     const last = merged.lastName || '';
                     const initials = (first.substring(0,1) + last.substring(0,1)).toUpperCase() || (merged.username || 'U').substring(0,1).toUpperCase();
                     initialsEl.textContent = initials;
                 }

                 // compute profile completeness
                 try {
                     const required = [merged.firstName, merged.lastName, merged.email, merged.phone, merged.address, merged.city, merged.state, merged.zip];
                     const filled = required.filter(v => v && String(v).trim().length > 0).length;
                     const pct = Math.round((filled / required.length) * 100);
                     const bar = document.getElementById('profileProgress');
                     const text = document.getElementById('profileProgressText');
                     if (bar) bar.style.width = pct + '%';
                     if (text) text.textContent = pct + '%';
                 } catch {}
             })
             .catch(error => {
                 if (error && error.response && error.response.status === 401) {
                     templateBuilder.append("error", { error: "Please login to view your profile." }, "errors");
                     showLoginForm();
                     return;
                 }

                 if (error && error.response && error.response.status === 404) {
                     templateBuilder.build("profile", {
                         firstName: "",
                         lastName: "",
                         phone: "",
                         email: "",
                         address: "",
                         city: "",
                         state: "",
                         zip: ""
                     }, "main");
                     templateBuilder.append("message", { message: "No profile found. Please complete your profile." }, "errors");
                     return;
                 }

                 templateBuilder.append("error", { error: "Load profile failed." }, "errors")
             })
    }

    updateProfile(profile)
    {
        const url = `${config.baseUrl}/profile`;

        const payload = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            email: profile.email,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip: profile.zip
        };

        axios.put(url, payload, { headers: userService.getHeaders() })
             .then(() => {
                 templateBuilder.append("message", { message: "Profile updated successfully." }, "errors")
             })
             .catch(error => {
                 if (error && error.response && error.response.status === 401) {
                     templateBuilder.append("error", { error: "Please login before saving your profile." }, "errors");
                     showLoginForm();
                     return;
                 }

                 templateBuilder.append("error", { error: "Save profile failed." }, "errors")
             })
    }
}

document.addEventListener("DOMContentLoaded", () => {
   profileService = new ProfileService();
});
