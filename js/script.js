
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

            const button = this;
            const article = articles[i];
            
            if (button.innerHTML === 'More') 
            {
                // Add loading state to button
                button.classList.add('loading');
                button.innerHTML = 'Loading...';
                
                // Add expanding animation to post
                article.classList.add('expanding');
                
                if (article.querySelector('.article') === null) 
                {
                    let div = document.createElement('div');
                    div.className = "article";
                    article.insertBefore(div, button);

                    // Load content
                    div.innerHTML = PushXMLRequest('GET', '../posts/' + 
                                    article.querySelector('h1').innerHTML + '.html', false);

                    // Animate content appearance
                    setTimeout(() => {
                        div.classList.add('show');
                        
                        // Initialize image sliders if they exist in the loaded content
                        const sliders = div.querySelectorAll('.image-slider');
                        sliders.forEach(slider => {
                            const containerId = slider.id;
                            if (containerId && typeof ImageSlider !== 'undefined') {
                                new ImageSlider(containerId);
                            }
                        });

                        // Execute any scripts in the loaded content
                        if (div.querySelector('script') !== null) 
                        {
                            let script = document.createElement('script');
                            script.type = "text/javascript";
                            script.text = div.querySelector('script').innerHTML;
                            document.body.appendChild(script);
                        }
                        
                        // Update button state
                        button.classList.remove('loading');
                        button.innerHTML = 'Close';
                        
                        // Remove expanding animation
                        setTimeout(() => {
                            article.classList.remove('expanding');
                        }, 300);
                        
                    }, 50);
                }
                else
                {
                    const existingDiv = article.querySelector('.article');
                    existingDiv.classList.remove('hide');
                    existingDiv.classList.add('show');
                    
                    // Update button state
                    setTimeout(() => {
                        button.classList.remove('loading');
                        button.innerHTML = 'Close';
                        article.classList.remove('expanding');
                    }, 300);
                }
            }
            else
            {
                // Add collapsing animation to post
                article.classList.add('collapsing');
                
                const existingDiv = article.querySelector('.article');
                if (existingDiv) {
                    existingDiv.classList.remove('show');
                    existingDiv.classList.add('hide');
                }
                
                // Update button after animation
                setTimeout(() => {
                    button.innerHTML = 'More';
                    article.classList.remove('collapsing');
                }, 600);
            }

        });
    }
    
} Main();