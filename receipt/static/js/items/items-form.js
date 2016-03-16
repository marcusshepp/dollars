/* Item Form.
 *
 */

function init_item_form(){
    /* Builds Item Form ?? */
    $.ajax({
        type: "GET",
        url: "/api/catagories/",
        success: function(data){
            if (parseInt(data.catagory_length) > 0){
                build_item_form(data.catagory_length, data.catagory_names, data.catagory_ids);
            } else {
                build_catagory_form(no_catagories=true);
            }
        },
        failure: function(){
            console.log("failue @ init_item_form");
        },
    });
}

function build_item_form(cata_length, cata_names, cata_ids){
    var item_form = "";
    item_form += '<h4 id="item_form_header">Add New Item</h4>';
    item_form += '<form class="formmy item_form" action="" method="POST" enctype="multipart/form-data">';
    item_form += '<p><label for="name">Name: </label><input type="text" ';
    item_form += 'placeholder="Name of Item" name="name" max_length="250"/ class=""></p>';
    item_form += '<p><label for="company_came_from">Company: </label>';
    item_form += '<input type="text" placeholder="Where does this come from?" ';
    item_form += 'name="company_came_from" max_length="50" class=""></p>';
    item_form += '<p><label for="catagory">Catagory: </label>';
    item_form += '<span class="add_catagory" onclick="build_catagory_form()">Add</span>';
    item_form += '<select name="catagory" class="catagory">';
    for (var i = 0; i < cata_length; i++){
        item_form += '<option name="catagory" value="'+cata_ids[i]+'">'+cata_names[i]+'</option>';
    }
    item_form += '</select></p>';
    item_form += '<p><label for="price">Price: </label><input type="number" ';
    item_form += 'placeholder="Price of Item" name="price" step="0.01" class="pull-right"></p>';
    item_form += '<input type="button" value="Add" class="" onclick="validate_new_item(this.form, false)">';
    item_form += '<input type="button" name="name" value="Add & Purchase"';
    item_form += ' class="" onclick="validate_new_item(this.form, true)">';
    item_form += '</form>';
    $(".item_form_container").html(item_form);
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
            url: "/api/catagories/",
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "catagory_name": catagory_value,
            },
            success: function(data){
                if(data.success){
                    $("#header").html("<p class=''>Successfully Added: "+catagory_value+"</p>");
                    if(data.first){
                        init_item_form();
                    }
                } else {
                    $("#header").html("<p class=''>FAIL</p>");
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
        catagory_form += "<span class='add_catagory' onclick='init_item_form()'>back</span>";
    }
    catagory_form += "<p><span><label for='catagory' class='pull-left' >Catagory: </label></span>";
    catagory_form += "<input type='text' style='display: none;' />";
    catagory_form += "<span><input type='text' placeholder='Enter New Catagory' class='new_catagory_input' /></span></p>";
    if(no_catagories) {
        catagory_form += '<input type="button" value="Add First Catagory" class="" onclick="add_new_catagory(); init_item_form();">';
    } else {
        catagory_form += '<input type="button" value="Add" class="" onclick="add_new_catagory(); init_item_form();">';
    }
    catagory_form += "</form>";
    $(".item_form_container").html(catagory_form);
}

/*
Create new Items + Validation
*/

function validate_new_item(form, purchase){
  /*
  Ajax POST to items API. View then creates a new item object.
  */
  var form_data = $(form).serializeArray();
  var name = form_data[0].value;
  var company_came_from = form_data[1].value;
  var catagory_id = form_data[2].value;
  var price = form_data[3].value;
  if (name.length < 4) {
    console.log("da fuc");
    $("#item_form_header").html("<p class=''>Item name must be longer than 3 characters.</p>");
  } else {
    create_new_item(name, company_came_from, price, catagory_id, purchase)
  }
  
  document.getElementsByClassName('item_form')[0].reset();
};

function create_new_item(name, company_came_from, price, catagory_id, purchase){
  $.ajax({
    type: 'POST',
    url: '/',
    data: {
      "csrfmiddlewaretoken": csrf_func(),
      "name": name,
      "company_came_from": company_came_from,
      "price": price,
      "catagory_id": catagory_id,
      "purchase": purchase,
    },
    success: function(data){
        $("#header").html("<p class=''>Successfully Added: " + name +  "</p>");
        create_action("Create Item", "Create Item: "+name, "undo add item");
        $("#item_form_header").html("Add New Item");
        get_items()
    },
    failure: function(){
      console.log("fail");
    },
  });
}