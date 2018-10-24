$(document).ready(function () {
    $(".notes").on("click", function (event) {
        event.preventDefault();
    })

    $.getJSON("/", function (data) {
        // console.log(data);
    });

    $(document).on("click", "#scrape", function (event) {
        event.preventDefault();
        $.get("/scrape", function (data) {
            // console.log(data);
            window.location.reload();
        });
    })

    $(document).on("click", ".submit-note", function (event) {
        event.preventDefault();
        var thisId = $(this).attr("data-id");
        var thisTitle = $(this).parent()[0][0];
        var titleInput = $(thisTitle).val();
        var thisBody = $(this).parent()[0][1];
        var bodyInput = $(thisBody).val();

        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                title: titleInput,
                body: bodyInput
            }
        })
            .then(function (data) {
                // console.log(data);
                window.location.reload();
            })
            .catch(function (err) {
                console.log(err)
            });
    });

    $(document).on("click", ".delete", function (event) {
        event.preventDefault();
        var thisId = $(this).attr("data-id");

        $.ajax({
            method: "POST",
            url: "/delete/" + thisId,
        })
            .then(function (data) {
                // console.log(data);
                window.location.reload();
            })
            .catch(function (err) {
                console.log(err)
            });
    });
});
