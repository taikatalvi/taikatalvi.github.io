
'use strict';


function isOnDisplay(obj)
{
    let obj_pos = obj.getBoundingClientRect();

    if( obj_pos.top - window.innerHeight <= -( window.innerHeight / 20 ) && (obj_pos.top + obj_pos.height > 10) )
        return true;
    else
        return false;
}

function Foo(obj, cls) // Adding class to element that is on display
{
    let a = document.getElementById(obj);

    if(isOnDisplay(a))
        a.classList.add(cls);
}


function FindLocalLinks()
{
    let local_links = [];

    let links = document.getElementsByTagName('a');
    // Local Links have a href length less than 10 characters
    let str_length = 10;

    // In each link we are looking a local one
    for (let i = 0; i < links.length; i++) 
        if(links[i].getAttribute('href').length < str_length)
            local_links.push(links[i]);
    
    return local_links; // And return all local links
}


function ScrollTo(element) 
{
    window.scrollTo(
    {
        'behavior': 'smooth',
        'left': 0,
        'top': element.offsetTop
    });
}

function PushXMLRequest(method, filename, mode)
{
    let xhr = new XMLHttpRequest();
            
    xhr.open(method, filename, mode);
    xhr.send();
            
    if (xhr.status != 200)
        alert('Error: ' + xhr.status + ': ' + xhr.statusText);
    else 
        return xhr.responseText;
}

function Main()
{
    document.addEventListener('wheel', function()
    {
        Foo('intro', 'intro-des2');
    });

    window.onload = function()
    {
        Foo('intro', 'intro-des2');
    };


    let local_links = FindLocalLinks();

    for (let i = 0; i < local_links.length; i++) 
    {
        local_links[i].addEventListener("click", 
        function(event)
        {
            event.preventDefault();

            ScrollTo(document.querySelector(this.getAttribute('href')));

        }, false);
    }
    

    // Projects section

    let projects = document.getElementById('projects');

    let articles = projects.querySelectorAll('article');

    let buttons  = projects.querySelectorAll('article > button');
    

    for (let i = 0; i < buttons.length; i++) 
    {
        buttons[i].addEventListener('click', function(event)
        {
            event.preventDefault();

            if (this.innerHTML === 'More') 
            {
                if (articles[i].querySelector('div') === null) 
                {
                    let div = document.createElement('div');

                    div.className = "article";

                    articles[i].insertBefore(div, this);

                
                    div.innerHTML = PushXMLRequest('GET', '../posts/' + 
                                    articles[i].querySelector('h1').innerHTML + '.html', false);

                    if (div.querySelector('script') !== null) 
                    {
                        let script = document.createElement('script');
                        script.type = "text/javascript";
                        script.text = div.querySelector('script').innerHTML;
                        
                        document.body.appendChild(script);
                    }
                }
                else
                    articles[i].querySelector('article').style.display = 'block';
                
                this.innerHTML = 'Close';
            }
            else
            {
                articles[i].querySelector('article').style.display = 'none';
                this.innerHTML = 'More';
            }

        });
    }
    
} Main();