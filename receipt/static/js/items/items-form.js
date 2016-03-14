/* Item Form.
 *
 */

function unbuild_catagory_form(){
    console.log("begin unbuild_catagory_form() ...");
    /* Builds Item Form ?? */
    $.ajax({
        type: "GET",
        url: "/api/catagories/",
        data: {
            "Bar": "Foo",
        },
        success: function(data){
            console.log(data);
            if (parseInt(data.catagory_length) > 0){
                console.log("parseInt(data.catagory_length) > 0 == TRUE");
                build_item_form(data.catagory_length, data.catagory_names, data.catagory_ids);
            } else {
                console.log("build_catagory_form();")
                build_catagory_form(no_catagories=true);
            }
        },
        failure: function(){
            console.log("failue @ unbuild_catagory_form");
        },
    });
}



/*
 * Catagory Stuff
 */

function add_new_catagory(){
    var catagory_value = $(".new_catagory_input").val();
    if (!catagory_value){
        $("#item_form_header").html("<p class='text-danger'>Please enter a value for a Catagory.</p>");
    }
    else {
        $.ajax({
            type: "POST",
            url: "/api/catagories/",
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "catagory_name": catagory_value,
            },
            success: function(data){
                if(data.success){
                    $("#header").html("<p class='text-success'>Successfully Added: "+catagory_value+"</p>");
                } else {
                    $("#header").html("<p class='text-danger'>FAIL</p>");
                }
            },
            failure: function(){
                console.log("failue @ add_new_catagory");
            },
        });
    }
}

function build_catagory_form(no_catagories){
    var catagory_form = "";
    catagory_form += "<h2 id='item_form_header'>Add A Catagory</h2>";
    if(no_catagories) {
        catagory_form += "<p>Add a Catagory before you can add any Items.</p>";
    }
    catagory_form += '<form class="formmy item_form" action="" method="POST" enctype="multipart/form-data">';
    if(no_catagories) {
        catagory_form += " ";
    } else {
        catagory_form += "<span class='add_catagory fa fa-close pull-right' onclick='unbuild_catagory_form()'>back</span>";
    }
    catagory_form += "<p><span><label for='catagory' class='pull-left' >Catagory: </label></span>";
    catagory_form += "<input type='text' style='display: none;' />";
    catagory_form += "<span><input type='text' placeholder='Enter New Catagory' class='new_catagory_input pull-right' /></span></p>";
    if(no_catagories) {
        catagory_form += '<input type="button" value="Add" class="btn btn-default" onclick="add_new_catagory(); unbuild_catagory_form();">';
    } else {
        catagory_form += '<input type="button" value="Add" class="btn btn-default" onclick="add_new_catagory(); unbuild_catagory_form();">';
    }
    catagory_form += "</form>";
    $(".item_form_container").html(catagory_form);
}
