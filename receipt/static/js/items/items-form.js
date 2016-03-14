/* Item Form.
 *
 */

// function init_item_form(){
//     console.log("begin init_item_form() ...");
//     /* Builds Item Form ?? */
//     $.ajax({
//         type: "GET",
//         url: "/api/catagories/",
//         data: {
//             "Bar": "Foo",
//         },
//         success: function(data){
//             console.log(data);
//             if (parseInt(data.catagory_length) > 0){
//                 console.log("parseInt(data.catagory_length) > 0 == TRUE");
//                 build_item_form(data.catagory_length, data.catagory_names, data.catagory_ids);
//             } else {
//                 console.log("build_catagory_form();")
//                 build_catagory_form(no_catagories=true);
//             }
//         },
//         failure: function(){
//             console.log("failue @ init_item_form");
//         },
//     });
// }

function build_item_form(cata_length, cata_names, cata_ids){
    var item_form = "";
    item_form += '<p><label for="name">Name: </label><input type="text" ';
    item_form += 'placeholder="Name of Item" name="name" max_length="250"/ class="pull-right"></p>';
    item_form += '<p><label for="company_came_from">Company: </label><input type="text" placeholder="Where does this come from?" name="company_came_from" max_length="50" class="pull-right"></p>';
    item_form += '<p><label for="catagory">Catagory: </label><span class="add_catagory fa fa-plus pull-right" onclick="build_catagory_form()"></span>';
    item_form += '<select name="catagory" class="pull-right catagory">';
    for (var i = 0; i < cata_length; i++){
        item_form += '<option name="catagory" value="'+cata_ids[i]+'">'+cata_names[i]+'</option>';
    }
    item_form += '</select></p>';
    item_form += '<p><label for="price">Price: </label><input type="number" placeholder="Price of Item" name="price" step="0.01" class="pull-right"></p>';
    item_form += '<input type="button" value="Add" class="btn btn-default" onclick="send_new_item(this.form, false)">';
    item_form += '<input type="button" name="name" value="Add & Purchase" class="btn btn-default" onclick="send_new_item(this.form, true)">';
    $(".item_form_container").html(item_form);
}
function init_item_form(){
  console.log("begin init_item_form() ...");
  $.get("/api/catagories/", function(data){
    build_item_form(data.catagory_length, data.catagory_names, data.catagory_ids);
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
        catagory_form += "<span class='add_catagory fa fa-close pull-right' onclick='init_item_form()'>back</span>";
    }
    catagory_form += "<p><span><label for='catagory' class='pull-left' >Catagory: </label></span>";
    catagory_form += "<input type='text' style='display: none;' />";
    catagory_form += "<span><input type='text' placeholder='Enter New Catagory' class='new_catagory_input pull-right' /></span></p>";
    if(no_catagories) {
        catagory_form += '<input type="button" value="Add" class="btn btn-default" onclick="add_new_catagory(); init_item_form();">';
    } else {
        catagory_form += '<input type="button" value="Add" class="btn btn-default" onclick="add_new_catagory(); init_item_form();">';
    }
    catagory_form += "</form>";
    $(".item_form_container").html(catagory_form);
}
