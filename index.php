<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ليون شاليه - استجمام ورفاهية</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <!-- GLightbox CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
    <!-- Local Font Awesome Pro CSS -->
    <link rel="stylesheet" href="./css/all.min.css">

    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #252824; }
        .text-primary { color: #B9C6BA; }
        .bg-primary { background-color: #B9C6BA; }

        /* **NEW**: Particle background container */
        #particles-js {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1; /* Place it behind all content */
        }
        
        #header-slider { position: relative; height: 100%; width: 100%; overflow: hidden; }
        .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.5s ease-in-out; }
        .slide.active { opacity: 1; }
        
        .reveal-container { position: relative; overflow: hidden; }
        .reveal-item { visibility: hidden; }
        .reveal-cover { position: absolute; top: 0; left: 0; width: 100%; height: 102%; background-color: #B9C6BA; transform: scaleX(0); transform-origin: right; }
        
        .stagger-item, .fade-in { opacity: 0; transform: translateY(20px); visibility: hidden; }
        
        .pulse-icon { animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    </style>
</head>
<body class="text-white bg-[#181818]">

<?php
    // --- PHP: Dynamic image loader ---
    $gallery_path = 'img/gallery/';
    $gallery_images = glob($gallery_path . '*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    // Shuffle images to show variety on each visit
    shuffle($gallery_images);
?>

    <!-- **NEW**: Particle background element -->
    <div id="particles-js"></div>

    <div class="max-w-xl mx-auto bg-[#2A2D29] bg-opacity-50 backdrop-blur-sm shadow-2xl min-h-screen">
        
        <header class="relative h-64">
            <div id="header-slider">
                <?php if (!empty($gallery_images)): ?>
                    <?php 
                        // Use first 3 images for the slider
                        $slider_images = array_slice($gallery_images, 0, 3);
                    ?>
                    <?php foreach ($slider_images as $index => $image): ?>
                        <div class="slide <?php if ($index == 0) echo 'active'; ?>" style="background-image: url('<?php echo $image; ?>');"></div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="slide active" style="background-color: #2a2a2a;"></div>
                <?php endif; ?>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
            <div class="absolute -bottom-12 w-full flex justify-center items-center gap-4 px-4">
                <img src="img/logo.png" alt="شعار ليون شاليه" class="w-24 h-24 rounded-2xl border-4 border-white bg-gray-800 object-cover shadow-lg shrink-0">
                <div class="flex flex-col"><h1 class="text-3xl md:text-4xl font-black tracking-tight">ليون شاليه</h1><p class="text-primary text-md md:text-lg">استجمام ورفاهية</p></div>
            </div>
        </header>

        <main class="pt-20 px-4 md:px-8 pb-12">
            
            <section class="flex justify-center space-x-4 space-x-reverse mb-8">
    
    <!-- Instagram Icon -->
    <a href="https://www.instagram.com/leon_tabuk/?igsh=MXJrZXFtdGJhNDh2OQ%3D%3D&utm_source=qr" class="stagger-item p-3 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gradient-to-br from-purple-600 to-pink-500 transition-all duration-300 transform hover:-translate-y-1">
        <i class="fa-brands fa-instagram fa-lg"></i>
    </a>

    <!-- TikTok Icon -->
    <a href="https://www.tiktok.com/@leon_tabuk?_t=ZS-8xdy0IOxuuu&_r=1" class="stagger-item p-3 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-[#ff0050] transition-all duration-300 transform hover:-translate-y-1">
        <i class="fa-brands fa-tiktok fa-lg"></i>
    </a>

    <!-- **NEW**: WhatsApp Icon -->
    <a href="https://wa.me/966539396664" target="_blank" rel="noopener noreferrer" class="stagger-item p-3 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:-translate-y-1">
        <i class="fa-brands fa-whatsapp fa-lg"></i>
    </a>

</section>

            <!-- Slogan Section -->
            <section class="stagger-item mb-12 text-center text-gray-200 text-lg">
                <p>نحن منتجع ليون نسعى في تطوير الرفاهية والخدمات الفندقية 🏠</p>
            </section>

            <section class="mb-12">
                <div class="reveal-container mb-6"><h2 class="reveal-item text-2xl md:text-3xl font-bold">معلومات الحجز والتواصل</h2><div class="reveal-cover"></div></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="stagger-item flex items-center space-x-4 space-x-reverse"><div class="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg shrink-0"><i class="fa-solid fa-envelope fa-lg text-primary"></i></div><div><p class="text-sm text-gray-400">البريد الإلكتروني</p><a href="mailto:lionresort04@gmail.com" class="font-semibold hover:text-primary transition" dir="ltr">lionresort04@gmail.com</a></div></div>
                    <div class="stagger-item flex items-center space-x-4 space-x-reverse"><div class="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg shrink-0"><i class="fa-solid fa-phone fa-lg text-primary"></i></div><div><p class="text-sm text-gray-400">للحجز والاستفسار</p><a href="tel:0539396664" class="font-semibold hover:text-primary transition" dir="ltr">0539396664</a></div></div>
                    <div class="stagger-item flex items-center space-x-4 space-x-reverse"><div class="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg shrink-0"><i class="fa-solid fa-clock fa-lg text-primary"></i></div><div><p class="text-sm text-gray-400">أوقات العمل</p><p class="font-semibold">وقت الدخول 4 الخروج 10</p></div></div>
                    <div class="stagger-item flex items-center space-x-4 space-x-reverse"><div class="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg shrink-0"><i class="fa-solid fa-map-marker-alt fa-lg text-primary"></i></div><div><p class="text-sm text-gray-400">الموقع</p><p class="font-semibold">طريق المدينه - خلف محطة ساسكو</p></div></div>
                </div>
            </section>
<!-- ======================================================= -->
<!--             **NEW**: Video Tour Section                 -->
<!-- ======================================================= -->
<section class="fade-in mb-12">
    <!-- Section Title with Reveal Animation -->
    <div class="reveal-container mb-6">
        <h2 class="reveal-item text-2xl md:text-3xl font-bold">جولة في المنتجع</h2>
        <div class="reveal-cover"></div>
    </div>

    <!-- Responsive Video Container -->
    <div class="rounded-2xl overflow-hidden border-2 border-gray-700 aspect-video">
        <iframe 
            class="w-full h-full" 
            src="https://www.youtube.com/embed/6KJbc9Zg3lw" 
            title="منتجع ليون 🏠 للحجز 0539396664 ‭☎️‬" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
        </iframe>
    </div>
</section>        
            <!-- <section class="fade-in mb-12">
                <div class="reveal-container mb-6"><h2 class="reveal-item text-2xl md:text-3xl font-bold">موقعنا على الخريطة</h2><div class="reveal-cover"></div></div>
                <div class="rounded-2xl overflow-hidden border-2 border-gray-700"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.644374376216!2d36.75428670000001!3d28.490254699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15a849e44b2ed73d%3A0x18a15b889aa1897d!2z2YTZitmI2YYg2LTYp9mE2YrYqQ!5e0!3m2!1sar!2seg!4v1751474605154!5m2!1sar!2seg" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
            </section> -->
            
            <section class="fade-in mb-12">
                <div class="reveal-container mb-6"><h2 class="reveal-item text-2xl md:text-3xl font-bold">معرض الصور</h2><div class="reveal-cover"></div></div>
                <div class="grid grid-cols-2 gap-3">
                    <?php if (!empty($gallery_images)): ?>
                        <?php foreach ($gallery_images as $image): ?>
                            <a href="<?php echo $image; ?>" class="glightbox" data-gallery="chalet-gallery">
                                <img src="<?php echo $image; ?>" alt="صورة من معرض ليون شاليه" class="rounded-xl w-full h-36 md:h-48 object-cover transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                            </a>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p class="col-span-2 text-center text-gray-400">لا توجد صور في المعرض حالياً.</p>
                    <?php endif; ?>
                </div>
            </section>

            <section class="fade-in">
    <div class="reveal-container mb-6 text-center">
        <h2 class="reveal-item text-2xl md:text-3xl font-bold">أهم المرافق والخدمات</h2>
        <div class="reveal-cover"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- الخدمة 1: مسبح خاص -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-person-swimming fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">مسبح خاص</h3>
            <p class="text-gray-400 text-sm">استمتع بخصوصية تامة في مسبح كبير ونظيف مع إطلالة رائعة.</p>
        </div>

        <!-- الخدمة 2: شاليهات عرسان -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-heart fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">شاليهات عرسان</h3>
            <p class="text-gray-400 text-sm">تجهيزات خاصة وأجواء رومانسية لتبدأوا حياتكم الجديدة بذكريات لا تُنسى.</p>
        </div>

        <!-- الخدمة 3: ركن شواء -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-fire-burner fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">ركن شواء</h3>
            <p class="text-gray-400 text-sm">مساحة مجهزة بالكامل للاستمتاع بحفلات الشواء مع العائلة والأصدقاء.</p>
        </div>

        <!-- الخدمة 4: ألعاب مائية -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-water-ladder fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">ألعاب مائية</h3>
            <p class="text-gray-400 text-sm">منطقة آمنة وممتعة للأطفال والكبار لإضافة المزيد من المرح إلى إقامتكم.</p>
        </div>

        <!-- الخدمة 5: قسم للمناسبات -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-cake-candles fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">قسم للمناسبات</h3>
            <p class="text-gray-400 text-sm">قاعة مجهزة لاستضافة حفلاتكم ومناسباتكم الخاصة، تتسع لـ 70 شخص.</p>
        </div>

        <!-- الخدمة 6: ضيافة ليون -->
        <div class="p-6 bg-[#2a2a2a] rounded-3xl text-center border-2 border-transparent hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg">
            <i class="pulse-icon fa-solid fa-bell-concierge fa-3x mx-auto mb-4 text-primary"></i>
            <h3 class="text-xl font-bold mb-2">ضيافة ليون</h3>
            <p class="text-gray-400 text-sm">فريقنا جاهز لخدمتكم وتلبية جميع متطلباتكم لضمان تجربة فندقية متكاملة.</p>
        </div>

    </div>
</section>
        </main>
    </div>

    <a href="https://wa.me/966539396664" target="_blank" rel="noopener noreferrer" class="fixed bottom-5 left-5 z-50 w-16 h-16 flex items-center justify-center bg-green-400 rounded-full shadow-lg hover:bg-green-500 transition-all transform hover:scale-110">
        <i class="fa-brands fa-whatsapp fa-2x text-black"></i>
    </a>
    
    <!-- Scripts -->
    <script src="./js/all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <!--  particles.js library -->
    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Header Slider
            let currentSlide = 0;
            const slides = document.querySelectorAll('#header-slider .slide');
            const slideCount = slides.length;
            if (slideCount > 1) {
                setInterval(() => {
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slideCount;
                    slides[currentSlide].classList.add('active');
                }, 4000);
            }

            // GLightbox
            GLightbox({ selector: '.glightbox', rtl: true });

            // GSAP Animations
            gsap.registerPlugin(ScrollTrigger);
            gsap.utils.toArray('.stagger-item').forEach((item,index)=>{gsap.fromTo(item,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:0.6,delay:index*0.1,scrollTrigger:{trigger:item,start:"top 90%",toggleActions:"play none none none"}})});
            gsap.utils.toArray('.fade-in').forEach(item=>{gsap.fromTo(item,{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:0.8,scrollTrigger:{trigger:item,start:"top 85%",toggleActions:"play none none none"}})});
            gsap.utils.toArray('.reveal-container').forEach(container=>{const item=container.querySelector('.reveal-item');const cover=container.querySelector('.reveal-cover');const tl=gsap.timeline({scrollTrigger:{trigger:container,start:"top 80%",toggleActions:"play none none reset"}});tl.to(cover,{scaleX:1,transformOrigin:'right',duration:0.7,ease:'power3.inOut'}).set(item,{autoAlpha:1}).to(cover,{scaleX:0,transformOrigin:'left',duration:0.7,ease:'power3.inOut'})});
            
            //  Particles.js Initialization
            particlesJS('particles-js', {
                "particles": {
                    "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": ["#B9C6BA", "#ffffff"] },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                    "size": { "value": 2, "random": true, "anim": { "enable": false } },
                    "line_linked": { "enable": false },
                    "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "bubble" }, "onclick": { "enable": false }, "resize": true },
                    "modes": { "bubble": { "distance": 100, "size": 4, "duration": 2, "opacity": 8, "speed": 3 } }
                },
                "retina_detect": true
            });
        });
    </script>
</body>
</html>