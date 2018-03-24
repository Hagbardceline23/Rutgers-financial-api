


  var config = {
    apiKey: "AIzaSyCAuS7wo5kH9qSfnnrenFLboe-mHv7YwYI",
    authDomain: "fir-2-34d7a.firebaseapp.com",
    databaseURL: "https://fir-2-34d7a.firebaseio.com",
    projectId: "fir-2-34d7a",
    storageBucket: "fir-2-34d7a.appspot.com",
    messagingSenderId: "768989767189"
  };


  firebase.initializeApp(config);
  var contactDatabase = firebase.database();
  

  

$(function()
{
    function after_form_submitted(data) 
    {
        if(data.result == 'success')
        {
            $('form#reused_form').hide();
            $('#success_message').show();
            $('#error_message').hide();
        }
        else
        {
            $('#error_message').append('<ul></ul>');

            jQuery.each(data.errors,function(key,val)
            {
                $('#error_message ul').append('<li>'+key+':'+val+'</li>');
            });
            $('#success_message').hide();
            $('#error_message').show();

            //reverse the response on the button
            $('button[type="button"]', $form).each(function()
            {
                $btn = $(this);
                label = $btn.prop('orig_label');
                if(label)
                {
                    $btn.prop('type','submit' ); 
                    $btn.text(label);
                    $btn.prop('orig_label','');
                }
            });
            
        }//else
    }

	$('#reused_form').submit(function(e)
      {
        var name = $("#name").val().trim();
        var email = $("#email").val().trim();
        var message = $("#message").val().trim();
        e.preventDefault();

        $form = $(this);
        //show some response on the button
        $('button[type="submit"]', $form).each(function()
        {
            
            $btn = $(this);
            $btn.prop('type','button' ); 
            $btn.prop('orig_label',$btn.text());
            $btn.text('Sending ...');

        });
        console.log("sent-message");
        contactDatabase.ref().push({
            name: name,
            message: message
          });


          
        
      });	
});



$(function()
{
	$('#captcha_reload').on('click',function(e)
	{
	  e.preventDefault();
	  d = new Date();
	  var src = $("img#captcha_image").attr("src");
	  src = src.split(/[?#]/)[0];
	  
	  $("img#captcha_image").attr("src", src+'?'+d.getTime());
	});
});
