NANO - jQuery Template Engine
=============================

***Basic Usage***

Assuming you have following JSON response:

<pre>
data= {
  user: {
    login: "tomek",
    first_name: "Thomas",
    last_name: "Mazur",
    account: {
      status: "active",
      expires_at: "2009-12-31"
    }
  }
}  
</pre>

you can make:

<code>
  $.nano("&lt;p&gt;Hello {user.first_name} {user.last_name}! Your account is &lt;strong&gt;{user.account.status}&lt;/strong&gt;&lt;/p&gt;", data)
</code>

and you get ready string:

<code>
  &lt;p&gt;Hello Thomas! Your account is &lt;strong&gt;active&lt;/strong&gt;&lt;/p&gt;
</code>

Simple huh?

***More Advanced Example***


Displaying list of twitter search results (JSONP API)

**html**

<pre>
  &lt;ul id=&quot;tweets&quot;&gt;&lt;/ul&gt;
</pre>

**javascript**

<pre>  
  var template = "&lt;li&gt;&lt;strong&gt;@{from_user}&lt;/strong&gt; {original_text}&lt;/li&gt;"
  var query = "beer OR vodka"
  var container = $("ul#tweets")

  $.getJSON("http://search.twitter.com/search.json?callback=?", {
      q: query
    }, function(data) {
      container.html("")
      $.each(data.results), function(i, item){
        container.append($.nano(template, item))
      }
    }
  }
</pre>