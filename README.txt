Portfolio — Edgar Gaillard (R3.12)
==================================
Static site, vanilla JavaScript (no framework, no CMS, no build step).

  index.html   minimal page shell (just loads the CSS and the two scripts)
  style.css    design tokens + layout (dark / light theme)
  js/data.js   ALL the content (profile, skills, experience, education, projects...)
  js/app.js    renders every section from data.js + filters, pop-ups, CV viewer, theme...
  assets/      CV PDF + images

Update the CV: export CV_GAILLARD_Edgar_EN_v2 from Canva as PDF and replace
assets/CV_GAILLARD_Edgar_EN.pdf (keep the same file name).

Deploy (IUT server): copy the whole folder into ~/public_html/portfolio
  scp -r portfolio/* login@51.83.36.122:~/public_html/portfolio/

Before going live (TODO)
- legal.html: host name, address and phone (IUT / OVH server), optional postal address
- privacy.html: ask the host whether server logs are kept and for how long
- index.html: put the final address of the site in og:url
