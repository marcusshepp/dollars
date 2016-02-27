$(document).ready(function(){
  // console.log($("#foo").value);
  $("#foo").value = "foo";
});

var csrf_func = function(){
  /* Grab cookie containing {% csrf_token %} django specific */
  var csrf = $.cookie("csrfmiddlewaretoken");
  var wrapper = document.createElement("div");
  wrapper.innerHTML = csrf;
  var csrf_element = wrapper.firstChild;
  return csrf_element.value;
}

function update_dom(){
  /*
  UPDATES DOM
  Ajax request to the items API.
  Populates the page with available items & purchases & total.
  */
  $.ajax({
      type: "GET",
      url: "/api/items",
      success: function(data){
        var item_markup = "";
        for (var i = 0; i < data.length; i++){
          var name = data.names[i];
          var company = data.companies[i];
          var price = data.prices[i];
          var times_purchased = data.times_purchased[i];
          var id = data.id[i];
          item_markup += '<form id="' + id + '" class="item col-sm-12 col-lg-12" action="api/items/" method="POST">';
          item_markup += '<input type="hidden" name="csrfmiddlewaretoken" value="' + csrf_func() + '" />';
          item_markup += '<div class="pull-left" id="item_' + id + '">' + name + '</div>';
          item_markup += "<div class='purchase_btn col-sm-4 pull-right' onclick='purchase_item("+id+")'>"+"Purchase"+"</div>"
          item_markup += '<span class="times_purchased pull-right"># of purchases: ' + times_purchased + '</span>';
          item_markup += '<span class="times_purchased pull-right">$ '+price+'</span>'
          item_markup += '</form>';

        }
        $(".items").html(item_markup);
        var purchased_items = "";
        for(var i = 0; i < data.purchased_length; i++){
          purchased_items += '<div class="row purchases">';
          purchased_items += "<div class='col-md-3 col-lg-3'>" + data.purchased_items_names[i] + "</div>"
          purchased_items += "<div class='col-md-3 col-lg-3'>" + data.purchased_date_created[i] + "</div>"
          purchased_items += "</div>";
          purchased_items += '<div class="purchase_border"></div>'
        }
        $("#purchased_items").html(purchased_items);
        if (data.total == 0){
            $("#total").html("<h3>$&emsp;" + data.total.toFixed(2) + "</h3>");
        } else {
            $("#total").html("<h3>$&emsp;" + data.total + "</h3>");
        }
        $("#purchases_header").html("<h3>Purchases Made: All Time ("+data.purchased_length+")");
      },
      failure: function(){
        console.log("fail");
      },
  });
}
/* DOM UPDATING INTERVALS */
// setInterval(update_dom, 3000);

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
// setInterval(update_undo, 3000);

function send_new_item(form, purchase){
  /*
  Ajax POST to items API. View then creates a new item object.
  */
  var form_data = $(form).serializeArray();
  var name = form_data[1].value;
  var company_came_from = form_data[2].value;
  var catagory_id = form_data[3].value;
  var price = form_data[4].value;
  $.ajax({
    type: 'POST',
    url: '/item/',
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
      }
    },
    failure: function(){
      console.log("fail");
    },
  });
  document.getElementsByClassName('item_form')[0].reset();
  update_dom()
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
    update_dom();
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
    par.replaceWith("<div class='options pull-right' onclick='show_options(this, "+id+")'><div class='fa fa-arrow-left'></div></div>")
    $("#"+id).find("span").show(); // IDK WHAT TO DO WITH THIS ATM
}
function build_edit_form(catagory_names, catagory_ids, catagory_length, name, company, catagory, price){
    var form_str = "";
    form_str += '<h4 id="item_form_header">Editing Item</h4>';
    form_str += '<form class="formmy item_form" enctype="multipart/form-data">';
    form_str += '<p><label for="name">Name: </label><input type="text" name="name" ';
    form_str += 'max_length="250" class="pull-right" value="'+company+'" /></p>';
    form_str += '<p><label for="company_came_from">Company: </label><input value="'+name+'" ';
    form_str += 'type="text" name="company_came_from" max_length="50" class="pull-right"></p>';
    form_str += '<p><label for="catagory">Catagory: </label>';
    form_str += '<select name="catagory" class="pull-right catagory">';
    for (var i = 0; i < catagory_length; i++){
        form_str += '<option name="catagory" value="'+catagory_ids[i]+'">'+catagory_names[i]+'</option>';
    }
    form_str += '</select>';
    form_str += '</p>';
    form_str += '<p><label for="price">Price: </label><input ';
    form_str += 'type="number" value='+price+' name="price" step="0.01" class="pull-right"></p>';
    form_str += '<input type="button" value="Edit" class="btn btn-default" onclick="edit_item(this.form, false)">';
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
                console.log("no id :(");
            } else {
                build_edit_form(
                    data.catagory_names,
                    data.catagory_ids,
                    data.catagory_length,
                    data.item_name,
                    data.item_catagory_name,
                    data.item_catagory_id,
                    data.item_price);
            }
            update_dom();
        },
    })
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
