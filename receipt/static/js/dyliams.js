$(document).ready(function(){
  // console.log($("#foo").value);
  $("#foo").value = "foo";
  get_items();
  // update_undo();
});

/* DOM UPDATING INTERVALS */
setInterval(get_items, 3000);
setInterval(update_undo, 3000);

var csrf_func = function(){
  /* Grab cookie containing {% csrf_token %} django specific */
  var csrf = $.cookie("csrfmiddlewaretoken");
  var wrapper = document.createElement("div");
  wrapper.innerHTML = csrf;
  var csrf_element = wrapper.firstChild;
  return csrf_element.value;
}

function get_items(){
  /*
  UPDATES DOM
  Ajax request to the items API.
  Populates the page with available items & purchases & total.
  */
  $.ajax({
      type: "GET",
      url: "/api/items",
      data: {
        'FOO': 'BAR',
      },
      success: function(data){
        build_items(data.length,
                    data.names,
                    data.companies,
                    data.prices,
                    data.times_purchased,
                    data.ids);
      },
      failure: function(){
        console.log("fail");
      },
  });
}
function build_items(length, names, companies, prices, times_purchased, ids){
    if (length > 0){
        var item_markup = "";
        for (var i = 0; i < length; i++){
          var name = names[i];
          var company = companies[i];
          var price = prices[i];
          var times_purchase = times_purchased[i];
          var id = ids[i];
          item_markup += '<form id="' + id + '" class="item col-sm-12 col-lg-12" action="api/items/" method="POST">';
          // item_markup += '<input type="hidden" name="csrfmiddlewaretoken" value="' + csrf_func() + '" />';
          item_markup += '<div class="pull-left" id="item_' + id + '">' + name;
          item_markup += '</div>';
          item_markup += '<div class="options pull-right" onclick="show_options(this, '+id+')">...</div>';
          item_markup += '<div class="purchase_btn pull-right" onclick="purchase_item('+id+')">Purchase</div>';
          item_markup += '<span class="times_purchased pull-right">$ '+price+'</span>'
          item_markup += '<span class="times_purchased pull-right"># of purchases: ' + times_purchase + '</span>';
          item_markup += '</div>';
          item_markup += '</form>';
        }
        $(".items").html(item_markup);
    } else {
        $(".items").html('<h4 class="no_items">You haven\'t created any Items yet.</h4>');
    }

}

function update_undo(){
    var latest_action_div = $("#latest_action");
    $.ajax({
      url: '/api/actions/',
      type: "GET",
      success: function(data){
          // console.log(data.latest_action_object_name);
          if (data.no_actions){
            latest_action_div.text("Nothing To Undo");
            latest_action_div.attr("onclick", "undo(\'none\')");
          } else {
            latest_action_div.text("Undo: \'"+ data.latest_action_object_name+"'");
            latest_action_div.attr("onclick", "undo(\'"+data.latest_action_undo_handler+"\')");
          }
      },
      failure: function(){
        console.log("fail");
      },
    });
}

function send_new_item(form, purchase){
  /*
  Ajax POST to items API. View then creates a new item object.
  */
  var form_data = $(form).serializeArray();
  var name = form_data[0].value;
  var company_came_from = form_data[1].value;
  var catagory_id = form_data[2].value;
  var price = form_data[3].value;
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
      if (data.invalid_form_data){
        $("#item_form_header").html("<p class='text-danger'>Invalid Form</p>");
      } else if (data.success) {
        $("#header").html("<p class='text-success'>Successfully Added: " + name +  "</p>");
        create_action("Create Item", "Create Item: "+name, "undo add item");
        $("#item_form_header").html("Add New Item");
        get_items()
      }
    },
    failure: function(){
      console.log("fail");
    },
  });
  document.getElementsByClassName('item_form')[0].reset();
};
function purchase_item(id){
  /*
  Creates a new purchase object by POST with Ajax.
  Also increases the int on the btn.
  */
  var form = $("#"+id)[0];
  var url = form.action;
  var form_data = $(form).serializeArray();
  $.ajax({
      type: 'POST',
      url: '/api/items/',
      data: {
          "csrfmiddlewaretoken": csrf_func(),
          "id": form.id,
      },
      success: function(){
          var name = $("#item_" + form.id).html()
          $("#header").html("<p style='color: green;'>Purchase Made:&emsp;" + name + "&emsp;<span class='fa fa-check'></></p>");
          create_action("Purchase", "Make purchase: "+name, "undo purchase");
      },
      error: function(){
          console.log("failure");
      },
  });
};

function undo(undo_handler){
    if (undo_handler == "undo purchase"){
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "undo": true,
                "object_name": "Purchase",
                "undo_handler": undo_handler,
            },
            success: function(data){
                $("#header").html("<p style='color: green;'>Purchase for:&emsp;" + data.item_purchased + "&emsp; Deleted<span class='fa fa-check'></></p>");
                update_dom();
            },
            error: function(){
                console.log("failure");
            },
        })
    } else if (undo_handler == "undo add item") {
        $.ajax({
            type: 'POST',
            url: '/api/actions/',
            data: {
                "csrfmiddlewaretoken": csrf_func(),
                "undo": true,
                "object_name": "Create Item",
                "undo_handler": undo_handler,
            },
            success: function(data){
                $("#header").html("<p style='color: green;'>Item:&emsp;" + data.deleted_item_name + "&emsp; Deleted<span class='fa fa-check'></></p>");
                update_dom();
            },
            error: function(){
                console.log("failure");
            },
        })
    } else if (undo_handler == "none"){
      console.log("doing nothing");
    }
}

function create_action(title, object_name, undo_handler){
    $.ajax({
        type:"POST",
        url:"/api/actions/",
        data: {
            "create_action": true,
            "title": title,
            "object_name": object_name,
            "undo_handler": undo_handler,
            "csrfmiddlewaretoken": csrf_func(),
        },
        success: function(data){
          console.log("success")
        },
        failure: function(){
          console.log("fail");
        },
    })
    // get_items();
}

function show_options(th, id){
    var options = '<div class="options pull-right">'
    options += '<div onclick="hide_options(this, '+id+')" class="">...</div>';
    options += '<div onclick="edit('+id+')">Edit</div>&emsp;<div onclick="del('+id+')">Delete</div>&emsp;';
    options += '<div onclick="purchase_w_new_price(this, '+id+')">Purchase w New Price</div></div>';
    var options_div = $(th);
    options_div.replaceWith(options);
    $("#"+id).find("span").hide();
}
function hide_options(th, id){
    var a_options = "<span>&#8594;</span>";
    var options_div = $(th);
    var par = options_div.parent().filter(".options");
    par.replaceWith("<div class='options pull-right' onclick='show_options(this, "+id+")'><div class=''>...</div></div>")
    $("#"+id).find("span").show(); // IDK WHAT TO DO WITH THIS ATM
}
function build_edit_form(catagory_names, catagory_ids, catagory_length, item_id, name, company, catagory, price){
    var form_str = "";
    form_str += '<h4 id="item_form_header">Editing Item: '+name+'</h4>';
    form_str += '<form class="formmy item_form" enctype="multipart/form-data">';
    form_str += '<p><label for="name">Name: </label><input type="text" name="name" placeholder="Name of Item" ';
    form_str += 'max_length="250" class="pull-right" value="'+name+'" /></p>';
    form_str += '<p><label for="company_came_from">Company: </label><input value="'+company+'" ';
    form_str += 'type="text" name="company_came_from" max_length="50" placeholder="Where does this come from?" class="pull-right"></p>';
    form_str += '<p><label for="catagory">Catagory: </label>';
    form_str += '<select name="catagory" class="pull-right catagory">';
    for (var i = 0; i < catagory_length; i++){
        form_str += '<option name="catagory" value="'+catagory_ids[i]+'">'+catagory_names[i]+'</option>';
    }
    form_str += '</select>';
    form_str += '</p>';
    form_str += '<p><label for="price">Price: </label><input ';
    form_str += 'type="number" value="'+price+'" placeholder="Price of Item" name="price" step="0.01" class="pull-right"></p>';
    form_str += '<input type="button" value="Save" class="edit_save_btn btn btn-default" onclick="edit_item(this.form, '+item_id+')">';
    form_str += '</form>';
    $(".item_form_container").html(form_str);
}
function edit(id){
    console.log(id);
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
        },
        success: function(data){
            if(data.no_id == true){
                console.log("no id :^(");
            } else {
                build_edit_form(
                    data.catagory_names,
                    data.catagory_ids,
                    data.catagory_length,
                    data.item_id,
                    data.item_name,
                    data.company_name,
                    data.item_catagory_id,
                    data.item_price);
            }
        },
    })
}
function edit_item(form, id){
    var form_data = $(form).serializeArray();
    // console.log(form_data);
    var name = form_data[0].value;
    var company_came_from = form_data[1].value;
    var catagory_id = form_data[2].value;
    var price = form_data[3].value;
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "edit": true,
            "name": name,
            "company_came_from": company_came_from,
            "price": price,
            "catagory_id": catagory_id,
        },
        success: function(data){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Edit Item: " + name + "<span class='fa fa-check'></></p>");
            // create_action("Purchase", "Make purchase: "+name, "undo purchase");
            get_items();
            document.getElementsByClassName('item_form')[0].reset();
            build_edit_form(data.catagory_names, data.catagory_ids, data.catagory_length, "", "", "", "", "")
            var item_form_btns = "";
            item_form_btns += '<input type="button" value="Add" class="btn btn-default" onclick="send_new_item(this.form, false)">';
            item_form_btns += '<input type="button" name="name" value="Add & Purchase" class="btn btn-default" onclick="send_new_item(this.form, true)">';
            $(".edit_save_btn").replaceWith(item_form_btns);
            get_items();
        },
    });
}
function del(id){
    $.ajax({
        url: "/api/items_edit/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "delete_item": 1,
        },
        success: function(){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Deleted Item: " + name + "<span class='fa fa-check'></></p>");
            // create_action("Purchase", "Make purchase: "+name, "undo purchase");
            update_dom();
        },
    });
}
function purchase_w_new_price(th, id){
    var markup = "<input ";
    markup += "type='number' ";
    markup += "name='price' ";
    markup += "step='0.01' />";
    markup += "<input type='button' ";
    markup += "onclick='post_purchase_w_new_price(this, "+id+")' "
    markup += "value='Submit' />"
    markup += "<div onclick='hide_options(this, "+id+")'>...</div>";
    $(th).parent().html(markup);
}
function post_purchase_w_new_price(th, id){
    var new_price = $("#"+id).find(":input")[1].value;
    // console.log($(th).find("input[type='number']")[0]);
    $.ajax({
        url: "/api/items/",
        type: "POST",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "id": id,
            "amount_payed": new_price,
        },
        success: function(){
            // console.log("success");
            var name = $("#item_"+id).html();
            $("#header").html("<p style='color: green;'>Purchase Made for: " + name + "&emsp; Amount Played: "+new_price+"<span class='fa fa-check'></></p>");
            create_action("Purchase", "Make purchase: "+name, "undo purchase");
        },
    });
}
function build_table(purchased_items_names, purchased_date_created, purchased_length, amount_payed, total){
    var purchased_items = "";
    purchased_items += '<div class="total">Total: '+ total +'</div>';
    purchased_items += '<table border="1">';
    purchased_items += '<tr>';
    purchased_items += '<td>Item Purchased</td>';
    purchased_items += '<td>Date Purchased</td>';
    purchased_items += '<td>Amount Spent</td>';
    purchased_items += '</tr>';
    for(var i = 0; i < purchased_length; i++){
      purchased_items += '<tr>';
      purchased_items += "<td>" + purchased_items_names[i] + "</td>"
      purchased_items += "<td>" + purchased_date_created[i] + "</td>"
      purchased_items += "<td>" + amount_payed[i] + "</td>"
      purchased_items += '</tr>';
    }
    purchased_items += '</table>';
    return purchased_items;
}
function update_purchase_tbl(){
    console.log("updating purchase table");
    $.ajax({
        type: "GET",
        url: "/api/purchases/",
        success: function(data){
            console.log(data);
            var purchased_items = build_table(  data.purchased_items_names,
                                                data.purchased_date_created,
                                                data.purchased_length,
                                                data.amount_payed,
                                                data.total);
            $("#purchased_items").html(purchased_items);
            if (data.total == 0){
                $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
            } else {
                $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
            }
            $("#purchases_header").html("<h3>Purchases Made: All Time ("+data.purchased_length+")");
        },
        failure: function(){
            console.log("fail @ update_purchase_tbl");
        },
    })
}
function filter_purchase_tbl_by_catagory(catagory_name){
    $.ajax({
        type: "POST",
        url: "/api/purchases/",
        data: {
            "csrfmiddlewaretoken": csrf_func(),
            "catagory_name": catagory_name,
        },
        success: function(data){
            console.log(data)
            console.log("success");
            var purchased_items = build_table(  data.purchased_items_names,
                                                data.purchased_date_created,
                                                data.purchased_length,
                                                data.amount_payed,
                                                data.total);
            $("#purchased_items").html(purchased_items);
            if (data.total == 0){
                $("#total").html("<span>$&emsp;" + data.total.toFixed(2) + "</span>");
            } else {
                $("#total").html("<span>$&emsp;" + data.total + "</span>");
            }
            var purchase_y_total = "";
            purchase_y_total += "<h3>Purchases Made: All Time ("+data.purchased_length+")";
            $("#purchases_header").html([purchase_y_total]);
        },
        failure: function(){
            console.log("failure @ filter_purchase_tbl_by_catagory");
        },
    })
}
function build_catagory_form(){
    var catagory_form = "";
    catagory_form += "<p><span><label for='catagory' class='pull-left' >Catagory: </label></span>";
    catagory_form += "<span><input type='text' placeholder='Enter New Catagory' class='add_catagory_input pull-right' /></span></p>";
    catagory_form += '<p><span><input type="button" value="Add" class="add_catagory_btn" onclick="add_new_catagory(); unbuild_catagory_form();" /></span></p>';
    $(".item_form").html(catagory_form);
}
function build_item_form(cata_length, cata_names, cata_ids){
  var item_form = "";
  item_form += '<p><label for="name">Name: </label><input type="text" placeholder="Name of Item" name="name" max_length="250"/ class="pull-right"></p>';
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
  $(".item_form").html(item_form);
}
function unbuild_catagory_form(){
  $.ajax({
    type: "GET",
    url: "/api/catagories/",
    success: function(data){
      build_item_form(data.catagory_length, data.catagory_names, data.catagory_ids);
    },
    failure: function(){
      console.log("failue @ unbuild_catagory_form");
    },
  });
}
function add_new_catagory(){
    var catagory_value = $(".add_catagory_input").val();
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
