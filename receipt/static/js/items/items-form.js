/* Item Form.
 *
 */

function catagory_url(){
    return "/dollars/api/catagories/";
}

function init_item_form(){
    /* Builds Item Form */
    $.ajax({
        type: "GET",
        url: catagory_url(),
        success: function(data){
            if (data.not_logged_in){
                return 1
            }
            else if (data.cata.length > 0){
                build_item_form(data.cata);
            } else {
                build_catagory_form(no_catagories=true);
            }
        },
        failure: function(){
            console.log("failue @ init_item_form");
        },
    });
}

function build_item_form(cata){
    var item_form = "";
    item_form += '<form class="formmy item_form" action="" method="POST" enctype="multipart/form-data">';
    item_form += '<p><label for="name" class="item_form_label">Name: </label><input type="text" ';
    item_form += 'placeholder="Name of Item" name="name" max_length="250" class="item_form_input item_form_input_name" /></p>';
    item_form += '<p><label for="where_from" class="item_form_label">Company: </label>';
    item_form += '<input type="text" placeholder="Where does this come from?" ';
    item_form += 'name="where_from" max_length="50" class="item_form_input" /></p>';
    item_form += '<p><label for="catagory" class="item_form_label">Catagory: </label>';
    item_form += '<input type="button" value="Add" class="add_catagory" onclick="build_catagory_form(no_catagories=false)">';
    item_form += '<select name="catagory" class="item_form_catagory">';
    for (var i = 0; i < cata.length; i++){
        var cata_name = cata[i][0];
        var cata_id = cata[i][1];
        item_form += '<option name="catagory" value="'+cata_id+'">'+cata_name+'</option>';
    }
    item_form += '</select></p>';
    item_form += '<p><label for="price" class="item_form_label">Price: </label><input type="number" ';
    item_form += 'placeholder="Price of Item" name="price" step="0.01" class="item_form_input"></p>';
    item_form += '<div class="item_form_btns">';
    item_form += '<input type="button" value="Add" class="item_form_btn" onclick="validate_new_item(this.form, false)">';
    item_form += '<input type="button" value="Add & Purchase" class="item_form_btn" onclick="validate_new_item(this.form, true)">';
    item_form += '</div>';
    item_form += '</form>';
    $(".item_form_container").html(item_form);
}

/*
Create new Items + Validation
*/

function validate_new_item(form, purchase){
  /*
  Validate data within the item form before submitting to server.
  */
  var form_data = $(form).serializeArray();
  console.log(form_data);
  if (form_data.length < 4){
    $(".form_error_container").html("Please fill out all fields in form.");
  } else {
    var name = form_data[0].value;
    var company_came_from = form_data[1].value;
    var catagory_id = form_data[2].value;
    var price = form_data[3].value;
    if (name.length < 4) {
      $(".form_error_container").html("Item name must be longer than 3 characters.");
    } else {
      create_new_item(name, company_came_from, price, catagory_id, purchase)
    }
  }
};

function create_new_item(name, company_came_from, price, catagory_id, purchase){
  $.ajax({
    type: 'POST',
    url: '/dollars/',
    data: {
      "csrfmiddlewaretoken": csrf_func(),
      "name": name,
      "where_from": company_came_from,
      "price": price,
      "catagory_id": catagory_id,
      "purchase": purchase,
    },
    success: function(data){
      $("#header").html("Successfully Added: " + name);
      create_action("Create Item", "Create Item: "+name, "undo add item");
      init_item_form();
      init_item_list();
      document.getElementsByClassName('item_form')[0].reset();
    },
    failure: function(){
      console.log("fail");
    },
  });
}

/*
 * Catagory Stuff
 */

function add_new_catagory(){
    var catagory_value = $(".new_catagory_input").val();
    if (!catagory_value){
        $("#item_form_header").html("<p class=''>Please enter a value for a Catagory.</p>");
    } else {
        $.ajax({
            type: "POST",
            url: catagory_url(),
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "catagory_name": catagory_value,
            },
            success: function(data){
                if (data.success) {
                    $("#header").html("<p class=''>Successfully Added: "+catagory_value+"</p>");
                    init_item_form();
                }
            },
            failure: function(){
                console.log("failue @ add_new_catagory");
            },
        });
    }
}
function validate_new_catagory(){
    var catagory_value = $(".new_catagory_input").val();
    if (catagory_value.length < 4){
        $('#item_form_header').html("Catagory name needs to be greater than 4 characters in length.");
    } else {
        add_new_catagory();
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
        catagory_form += "<span class='cata_back_btn' onclick='init_item_form()'>back</span>";
    }
    catagory_form += "<p><span><label for='catagory' class='pull-left' >Catagory: </label></span>";
    catagory_form += "<input type='text' style='display: none;' />";
    catagory_form += "<span><input type='text' placeholder='Enter New Catagory' class='new_catagory_input' /></span></p>";
    if(no_catagories) {
        catagory_form += '<input type="button" value="Add First Catagory" class="" onclick="validate_new_catagory();">';
    } else {
        catagory_form += '<input type="button" value="Add" class="" onclick="validate_new_catagory();">';
    }
    catagory_form += "</form>";
    $(".item_form_container").html(catagory_form);
}
function clear_form_error(){
  $(".form_error_container").html("");
}
function toggle_item_form(){
  var value = $(".item_form_toggle_hide_btn").val();
  if (value == "Hide"){
    $(".item_form_toggle_hide_btn").val("Show");
  } else {
    $(".item_form_toggle_hide_btn").val("Hide");
  }
  $(".item_form_container").slideToggle();
} 