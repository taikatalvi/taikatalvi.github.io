'use strict';


function isOnDisplay(obj)
{
    let obj_pos = obj.getBoundingClientRect();

    if( obj_pos.top - window.innerHeight <= -( window.innerHeight / 20 ) && (obj_pos.top + obj_pos.height > 10) )
        return true;
    else
        return false;
}

// Add a class to the element once it becomes visible in the viewport
function RevealOnDisplay(id, cls)
{
    let element = document.getElementById(id);

    if(isOnDisplay(element))
        element.classList.add(cls);
}


// Collect all in-page anchor links (href starting with '#')
function FindAnchorLinks()
{
    let anchor_links = [];

    let links = document.getElementsByTagName('a');

    for (let i = 0; i < links.length; i++)
    {
        let href = links[i].getAttribute('href');

        if(href && href.startsWith('#'))
            anchor_links.push(links[i]);
    }

    return anchor_links;
}


function ScrollTo(element) 
{
    // Account for the sticky header height so sections are not hidden behind it
    const header = document.querySelector('.page-header');
    const offset = header ? header.offsetHeight : 0;

    // The sticky header's offsetTop equals the current scroll position when it
    // is stuck, so it cannot be used as a target. Scrolling to the header
    // simply means scrolling to the very top of the page.
    const top = (element === header)
        ? 0
        : element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo(
    {
        'behavior': 'smooth',
        'left': 0,
        'top': Math.max(0, top)
    });
}

// Highlight the nav link of the section currently in view
function SetupActiveSectionHighlight()
{
    const nav_links = document.querySelectorAll('.header-nav a');
    const sections = [];

    nav_links.forEach(link =>
    {
        const section = document.querySelector(link.getAttribute('href'));

        if (section)
            sections.push({ link: link, section: section });
    });

    function updateActive()
    {
        // A section is "current" when its top passes the upper third of the viewport
        const probe = window.innerHeight * 0.35;
        let current = null;

        sections.forEach(item =>
        {
            if (item.section.getBoundingClientRect().top <= probe)
                current = item;
        });

        // Near the bottom of the page the last section (e.g. a short footer)
        // may never reach the probe line, so activate it explicitly.
        const at_bottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

        if (at_bottom && sections.length > 0)
            current = sections[sections.length - 1];

        sections.forEach(item => item.link.classList.toggle('active', item === current));
    }

    document.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
}

// Fetch a post file and return its text content
async function LoadPost(filename)
{
    const response = await fetch(filename);

    if (!response.ok)
        throw new Error('Error: ' + response.status + ': ' + response.statusText);

    return response.text();
}

// Parse a full post HTML document and inject it into the target div.
// Post-specific styles are moved to <head> once per post to avoid duplicates.
function InjectPostContent(div, html, postName)
{
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Move post styles into the document head (only once per post)
    const styleMarker = 'post-style-' + postName;

    if (document.querySelector(`style[data-post="${styleMarker}"]`) === null)
    {
        doc.querySelectorAll('head style').forEach(style =>
        {
            const el = document.createElement('style');
            el.dataset.post = styleMarker;
            el.textContent = style.textContent;
            document.head.appendChild(el);
        });
    }

    div.innerHTML = doc.body.innerHTML;
}

// Initialize image sliders inside the given root element.
// Instances are stored on the slider element so they are created only once.
function InitSliders(root)
{
    const sliders = root.querySelectorAll('.image-slider');

    sliders.forEach(slider =>
    {
        if (slider.id && typeof ImageSlider !== 'undefined' && !slider.sliderInstance)
            slider.sliderInstance = new ImageSlider(slider.id);
    });
}

function Main()
{
    document.addEventListener('wheel', function()
    {
        RevealOnDisplay('intro', 'intro-des2');
    });

    window.onload = function()
    {
        RevealOnDisplay('intro', 'intro-des2');
    };


    let anchor_links = FindAnchorLinks();

    SetupActiveSectionHighlight();

    for (let i = 0; i < anchor_links.length; i++) 
    {
        anchor_links[i].addEventListener("click", 
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
        buttons[i].addEventListener('click', async function(event)
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
                    const postName = article.querySelector('h1').innerHTML;

                    try
                    {
                        const html = await LoadPost('posts/' + postName + '.html');
                        InjectPostContent(div, html, postName);
                    }
                    catch (error)
                    {
                        div.remove();
                        button.classList.remove('loading');
                        button.innerHTML = 'More';
                        article.classList.remove('expanding');
                        alert(error.message);
                        return;
                    }

                    // Animate content appearance
                    setTimeout(() => {
                        div.classList.add('show');
                        
                        // Initialize image sliders if they exist in the loaded content
                        InitSliders(div);

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
                    
                    // Sliders keep their instances; nothing to re-initialize here
                    
                    // Update button state
                    setTimeout(() => 
                    {
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
