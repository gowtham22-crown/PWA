function loaderSwitch(type) {
  if (type) {
    $(".profileContainer").css("display", "none");
    $(".loader").fadeIn();
  } else {
    $(".profileContainer").fadeIn();
    $(".loader").fadeOut();
  }
}

$(document).ready(function () {
  loaderSwitch(true);
  fetch("/profileData")
    .then(async function (response) {
      // handle success
      let profile = null;
      if (response.status == 200) {
        profile = await response.json();
        $("#profileImg").attr("src", profile.picture);
        $("#userName").text(profile.name);
        $("#conversions").text(profile.transcriptions);
      }

      if (profile.transcriptions > 0) {
        loaderSwitch(false);

        fetch("/conversions")
          .then(async function (response1) {
            // handle success
            if (response1.status == 200) {
              const conversions = await response1.json();

              const table = document.querySelector(".conversion-table");

              for (let i = 1; i <= conversions.length; i++) {
                let tr = document.createElement("TR");
                tr.className = "table-tr";
                let td = document.createElement("TH");
                td.setAttribute("scope", "row");
                td.innerHTML = i;
                tr.appendChild(td);

                td = document.createElement("TD");
                td.innerHTML = conversions[i - 1].convertedFrom;
                tr.appendChild(td);

                td = document.createElement("TD");
                td.innerHTML = conversions[i - 1].createdAt.substr(0, 10);
                tr.appendChild(td);

                td = document.createElement("TD");
                let btn = document.createElement("BUTTON");
                btn.className = "btn btn-primary";
                btn.id = "viewBtn";
                btn.innerHTML = "View";
                btn.setAttribute("data-bs-toggle", "modal");
                btn.setAttribute("data-bs-target", "#exampleModal");

                btn.onclick = function () {
                  const id = this.getAttribute("data-id");
                  for (let i = 0; i < conversions.length; i++) {
                    if (conversions[i].tid == id) {
                      $("#convertedText").text(conversions[i].convertedText);
                      break;
                    }
                  }
                };

                btn.setAttribute("data-id", conversions[i - 1].tid);

                td.appendChild(btn);
                tr.appendChild(td);

                table.appendChild(tr);
              }
            }
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          });
      } else {
        loaderSwitch(false);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});
