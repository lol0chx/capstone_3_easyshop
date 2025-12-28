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
                     secondaryPhone: "",
                     preferredContact: "email",
                     preferredContactEmail: true,
                     preferredContactPhone: false,
                     preferredContactSms: false,
                     newsletter: false,
                     address2: "",
                     country: ""
                 }, data);

                 // flags for contact select
                 merged.preferredContactEmail = merged.preferredContact === "email";
                 merged.preferredContactPhone = merged.preferredContact === "phone";
                 merged.preferredContactSms = merged.preferredContact === "sms";

                 templateBuilder.build("profile", merged, "main")
                 const mainEl = document.querySelector('main');
                 if (mainEl) mainEl.classList.add('no-sidebar');
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

    updateProfile(profile)
    {
        const url = `${config.baseUrl}/profile`;

        axios.put(url, profile, { headers: userService.getHeaders() })
             .then(() => {
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
