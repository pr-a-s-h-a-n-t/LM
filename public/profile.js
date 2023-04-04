const fullName = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const username = document.getElementById("username");

function generateBProfile() {
  axios
    .get("/read-profile")
    .then((res) => {
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const userData = res.data.data;
      fullName.innerHTML = `Name: ${userData.name}`;
      email.innerHTML = `Email: ${userData.email}`;
      phone.innerHTML = `UserId: ${userData.username}`;
      username.innerHTML = `Phone: ${userData.phone}`;
    })
    .catch((err) => {
      console.log(err);
    });
}

window.onload = function () {
  generateBProfile();
};
