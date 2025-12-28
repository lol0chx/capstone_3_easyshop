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
                     company: "",
                     dob: "",
                     gender: "",
                     secondaryPhone: "",
                     preferredContact: "email",
                     preferredContactEmail: true,
                     preferredContactPhone: false,
                     preferredContactSms: false,
                     newsletter: false,
                     address2: "",
                     country: "",
                     bio: "",
                     avatarDataUrl: ""
                 }, data);

                 // flags for contact select
                 merged.preferredContactEmail = merged.preferredContact === "email";
                 merged.preferredContactPhone = merged.preferredContact === "phone";
                 merged.preferredContactSms = merged.preferredContact === "sms";

                 // gender flags
                 merged.genderMale = merged.gender === "male";
                 merged.genderFemale = merged.gender === "female";
                 merged.genderOther = merged.gender === "other";
                 merged.genderUnknown = !merged.gender;

                 // load extras from localStorage
                 const user = userService.getCurrentUser();
                 const extrasKey = `profileExtras_${user.userId}`;
                 try {
                     const stored = localStorage.getItem(extrasKey);
                     if (stored) {
                         const extras = JSON.parse(stored);
                         Object.assign(merged, extras);
                     }
                 } catch {}

                 templateBuilder.build("profile", merged, "main")
                 const mainEl = document.querySelector('main');
                 if (mainEl) mainEl.classList.add('no-sidebar');

                 // set initials if no avatar
                 const initialsEl = document.getElementById('avatarInitials');
                 const avatarEl = document.getElementById('avatarPreview');
                 if (merged.avatarDataUrl && avatarEl) {
                     avatarEl.src = merged.avatarDataUrl;
                     avatarEl.style.display = 'block';
                     if (initialsEl) initialsEl.style.display = 'none';
                 } else if (initialsEl) {
                     const first = merged.firstName || '';
                     const last = merged.lastName || '';
                     const initials = (first.substring(0,1) + last.substring(0,1)).toUpperCase() || (merged.username || 'U').substring(0,1).toUpperCase();
                     initialsEl.textContent = initials;
                 }

                 // hook avatar file input for preview
                 const avatarInput = document.getElementById('avatar');
                 if (avatarInput && avatarEl) {
                     avatarInput.addEventListener('change', (e) => {
                         const file = e.target.files && e.target.files[0];
                         if (!file) return;
                         const reader = new FileReader();
                         reader.onload = (ev) => {
                             avatarEl.src = ev.target.result;
                             avatarEl.style.display = 'block';
                             if (initialsEl) initialsEl.style.display = 'none';
                         };
                         reader.readAsDataURL(file);
                     });
                 }
             })
             .catch(error => {
                 // If unauthorized, prompt to login
                 if (error && error.response && error.response.status === 401) {
                     templateBuilder.append("error", { error: "Please login to view your profile." }, "errors");
                     showLoginForm();
                     return;
                 }

                 // If not found, load empty form to allow first-time completion
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

                 const data = {
                     error: "Load profile failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }

    updateProfile(profile, extras)
    {
        const url = `${config.baseUrl}/profile`;

        // Only send fields the backend understands
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
                 // persist extras client-side
                 try {
                     const user = userService.getCurrentUser();
                     const extrasKey = `profileExtras_${user.userId}`;
                     localStorage.setItem(extrasKey, JSON.stringify(extras || {}));
                 } catch {}
                 const data = {
                     message: "The profile has been updated."
                 };

                 templateBuilder.append("message", data, "errors")
             })
             .catch(error => {
                 // If unauthorized, prompt login
                 if (error && error.response && error.response.status === 401) {
                     templateBuilder.append("error", { error: "Please login before saving your profile." }, "errors");
                     showLoginForm();
                     return;
                 }

                 const data = {
                     error: "Save profile failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }
}

document.addEventListener("DOMContentLoaded", () => {
   profileService = new ProfileService();
});
