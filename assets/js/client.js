function loaderSwitch(type) {
  if (type) {
    $(".loader").fadeIn();
    $("nav").css("display", "none");
    $("section").fadeOut();
  } else {
    $("nav").css("display", "");
    $("section").fadeIn();
    $(".loader").fadeOut();
  }
}

$(document).ready(function () {
  $("#saveBtn").css("display", "none");
  loaderSwitch(true);
  fetch("/profile")
    .then(function (response) {
      // handle success
      if (response.status == 401) {
        $("#profileBtn").css("display", "none");
        $("#logoutBtn").css("display", "none");
        $("#loginBtn").css("display", "");
      } else {
        $("#profileBtn").css("display", "");
        $("#logoutBtn").css("display", "");
        $("#loginBtn").css("display", "none");
      }
      loaderSwitch(false);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
  let started = true;

  const content = document.querySelector(".content");

  $("#liveToastBtn").on("click", function () {
    // $(".toast").removeClass("hide");
    const SpeechRecog =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecog();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = function () {
      console.log("voice is activated,speak");
    };

    recog.onresult = function (event) {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      content.textContent = transcript;

      $("#saveBtn").fadeIn(100);
    };

    recog.onend = function () {
      console.log("Speech recognition service disconnected");
      $("#liveToastBtn").text("Start");
      $("#liveToastBtn")
        .removeClass("btn btn-danger py-2 px-4")
        .addClass("btn btn-primary py-2 px-4");
      recog.stop();
      started = true;
    };

    if (started) {
      content.textContent = "";
      $("#liveToastBtn").text("Stop");
      $("#liveToastBtn")
        .removeClass("btn btn-primary py-2 px-4")
        .addClass("btn btn-danger py-2 px-4");
      recog.start();
      started = false;
    } else {
      $("#liveToastBtn").text("Start");
      $("#liveToastBtn")
        .removeClass("btn btn-danger py-2 px-4")
        .addClass("btn btn-primary py-2 px-4");
      recog.stop();
      started = true;
    }
  });

  $("#saveBtn").on("click", function () {
    $("#btnLoader").removeClass("d-none");
    $("#btnLoader").addClass("me-2");

    $("#saveBtn").attr("disabled", "disabled");
    $("#saveBtn").text("Saving");

    const data = {
      convertedFrom: "Realtime Audio",
      convertedText: content.innerHTML,
    };

    if (content.innerHTML.length > 0) {
      fetch("/save", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) =>
          response.status == 200
            ? ($("#saveBtn").removeAttr("disabled"),
              $("#saveBtn").text("Saved").text("Save").fadeOut(300))
            : response.status == 401
            ? (location.href = "/views/login.html")
            : alert("Something went wrong,Try again")
        )

        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      alert("Conversion can't be empty");
    }
  });
});
