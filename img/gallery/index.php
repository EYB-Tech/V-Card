<?php
// ===================================================================
//  VISUAL GALLERY PANEL (v3.2) - By AI Assistant
//  Features: Icon-based buttons, Tooltips, and enhanced card design.
// ===================================================================
session_start();

// --- Configuration & Security ---
define('GALLERY_PATH', __DIR__);
define('ENV_FILE_PATH', GALLERY_PATH . '/.env');
define('MAX_FILE_SIZE', 8 * 1024 * 1024);
define('ALLOWED_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
define('WEBP_QUALITY', 75);

// --- Helper Functions (loadEnv, convertToWebp) ---
function loadEnv($path) { if (!file_exists($path)) { die("Fatal Error: .env file is missing."); } $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES); foreach ($lines as $line) { if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) continue; list($name, $value) = explode('=', $line, 2); $value = trim(trim($value), '"'); $_ENV[trim($name)] = $value; } }
function convertToWebp($sourcePath, $destinationPath, $quality = 75) { if (!function_exists('imagewebp')) { return ['success' => false, 'message' => 'GD library with WebP support is not enabled.']; } $finfo = finfo_open(FILEINFO_MIME_TYPE); $mime_type = finfo_file($finfo, $sourcePath); finfo_close($finfo); if (!in_array($mime_type, ALLOWED_MIMES)) { return ['success' => false, 'message' => 'File type is not a valid image.']; } list($width, $height) = @getimagesize($sourcePath); if ($width === null || $height === null) { return ['success' => false, 'message' => 'Could not read image dimensions. File might be corrupt.']; } $image = null; try { switch ($mime_type) { case 'image/jpeg': $image = @imagecreatefromjpeg($sourcePath); break; case 'image/png': $image = @imagecreatefrompng($sourcePath); imagepalettetotruecolor($image); imagealphablending($image, true); imagesavealpha($image, true); break; case 'image/webp': return copy($sourcePath, $destinationPath) ? ['success' => true] : ['success' => false, 'message' => 'Could not copy WebP file.']; } if ($image === false) { return ['success' => false, 'message' => 'Failed to create image resource.']; } if (!imagewebp($image, $destinationPath, $quality)) { return ['success' => false, 'message' => 'Failed to save WebP image.']; } return ['success' => true]; } finally { if ($image) imagedestroy($image); } }


// --- Main Application Logic ---
loadEnv(ENV_FILE_PATH);
$admin_pass_hash = $_ENV['ADMIN_PASSWORD_HASH'] ?? '';
if (empty($admin_pass_hash)) { die("Security Alert: ADMIN_PASSWORD_HASH is not set in the .env file."); }

$is_logged_in = isset($_SESSION['gallery_logged_in']) && $_SESSION['gallery_logged_in'] === true;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['login'])) {
        if (password_verify($_POST['password'] ?? '', $admin_pass_hash)) {
            $_SESSION['gallery_logged_in'] = true;
            header("Location: " . $_SERVER['PHP_SELF']); exit;
        } else {
            $_SESSION['message'] = ['type' => 'error', 'text' => 'كلمة المرور غير صحيحة.'];
        }
    }
    if (isset($_POST['logout'])) { session_destroy(); header("Location: " . $_SERVER['PHP_SELF']); exit; }
    
    if ($is_logged_in) {
        if (isset($_POST['upload_image']) && isset($_FILES['image_files'])) {
            $files = $_FILES['image_files']; $upload_count = 0; $error_messages = [];
            foreach ($files['name'] as $key => $name) {
                if ($files['error'][$key] !== UPLOAD_ERR_OK) continue;
                $sanitized_name = substr(preg_replace('/[^a-zA-Z0-9-_\.]/', '', pathinfo($name, PATHINFO_FILENAME)), 0, 50);
                $webp_filename = $sanitized_name . '-' . time() . '-' . ($key + 1) . '.webp';
                $destination_path = GALLERY_PATH . '/' . $webp_filename;
                $result = convertToWebp($files['tmp_name'][$key], $destination_path, WEBP_QUALITY);
                if ($result['success']) $upload_count++; else $error_messages[] = htmlspecialchars($name) . ": " . $result['message'];
            }
            $msg = "تم رفع وتحويل {$upload_count} صورة بنجاح.";
            if(!empty($error_messages)) $msg .= "<br>الأخطاء: <br>" . implode("<br>", $error_messages);
            $_SESSION['message'] = ['type' => $upload_count > 0 ? 'success' : 'error', 'text' => $msg];
            header("Location: " . $_SERVER['PHP_SELF']); exit;
        }

        if (isset($_POST['delete_image']) && !empty($_POST['filename'])) {
            $filename = basename($_POST['filename']);
            if ($filename === 'index.php' || $filename === '.env') { $_SESSION['message'] = ['type' => 'error', 'text' => 'لا يمكن حذف هذا الملف.']; }
            else {
                $filepath = GALLERY_PATH . '/' . $filename;
                if (file_exists($filepath) && is_writable($filepath)) { unlink($filepath); $_SESSION['message'] = ['type' => 'success', 'text' => 'تم حذف الصورة: ' . htmlspecialchars($filename)]; }
                else { $_SESSION['message'] = ['type' => 'error', 'text' => 'خطأ في حذف الصورة.']; }
            }
            header("Location: " . $_SERVER['PHP_SELF']); exit;
        }
    }
}

$message = $_SESSION['message'] ?? null; unset($_SESSION['message']);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم المعرض</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
    <style>
        body { font-family: 'Cairo', sans-serif; background-color: #111827; }
        .glass-card { background-color: rgba(31, 41, 55, 0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .input-field { @apply block w-full p-3 text-gray-900 border border-gray-600 rounded-lg bg-gray-700 text-base placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500; }
        .drop-zone { border: 2px dashed #4b5563; } .drop-zone.dragover { border-color: #3b82f6; background-color: #1f2937; }
        [x-cloak] { display: none !important; }
        /* Tooltip styles */
        .tooltip { @apply invisible absolute; }
        .has-tooltip:hover .tooltip { @apply visible z-50; }
    </style>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="text-gray-200" x-data="{ isModalOpen: false, modalFilename: '' }">

<?php if (!$is_logged_in): // --- LOGIN VIEW --- ?>
    <div class="min-h-screen flex items-center justify-center px-4" style="background-image: radial-gradient(circle at top right, rgba(12, 74, 110, 0.2), transparent), radial-gradient(circle at bottom left, rgba(12, 74, 110, 0.2), transparent);">
        <div class="w-full max-w-md p-8 space-y-8 rounded-2xl glass-card">
            <div><h2 class="text-3xl font-bold text-center text-white">لوحة التحكم</h2><p class="mt-2 text-center text-sm text-gray-400">يرجى إدخال كلمة المرور للوصول</p></div>
            <?php if ($message): ?><div class="p-4 text-sm rounded-lg <?= $message['type'] === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200' ?>"><?= $message['text']; ?></div><?php endif; ?>
            <form class="space-y-6" method="POST" action="">
                <div><label for="password" class="sr-only">كلمة المرور</label><input id="password" name="password" type="password" required class="input-field !p-4" placeholder="كلمة المرور"></div>
                <button type="submit" name="login" class="inline-flex items-center justify-center w-full px-5 py-3 text-base font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-900">تسجيل الدخول</button>
            </form>
        </div>
    </div>
<?php else: // --- DASHBOARD VIEW --- ?>
    <div class="min-h-screen">
        <header class="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40"><div class="container mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-16"><h1 class="text-xl font-bold text-white">لوحة تحكم المعرض</h1><form method="POST" action=""><button type="submit" name="logout" class="text-sm font-semibold text-gray-300 hover:text-white transition">تسجيل الخروج</button></form></div></div></header>

        <main class="container mx-auto p-4 sm:p-6 lg:p-8">
            <?php if ($message): ?><div class="p-4 mb-6 text-sm rounded-lg <?= $message['type'] === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200' ?>" role="alert"><?= nl2br($message['text']); ?></div><?php endif; ?>
            
            <div class="mb-8 p-6 rounded-2xl glass-card">
                <form id="upload-form" method="POST" action="" enctype="multipart/form-data" class="space-y-4">
                    <div id="drop-zone" class="flex items-center justify-center w-full drop-zone rounded-lg"><label for="image-files" class="flex flex-col items-center justify-center w-full h-32 cursor-pointer"><div class="flex flex-col items-center justify-center"><svg class="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414A1 1 0 0116.414 3H17a4 4 0 014 4v5a4 4 0 01-4 4h-1.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 007.586 16H7z"></path></svg><p class="text-sm text-gray-400"><span class="font-semibold">اختر الصور</span> أو اسحبها هنا</p></div><input id="image-files" name="image_files[]" type="file" class="hidden" multiple accept="image/jpeg,image/png,image/webp"></label></div>
                    <div id="file-list-wrapper" class="hidden"><p class="font-semibold mb-2">الصور المحددة:</p><div id="file-list" class="text-sm"></div></div>
                    <div class="text-center"><button type="submit" name="upload_image" class="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-900">رفع الصور المحددة</button></div>
                </form>
            </div>

            <div>
                <h2 class="text-2xl font-bold mb-4">الصور الحالية</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    <?php
                    $images = glob(GALLERY_PATH . '/*.{webp}', GLOB_BRACE);
                    if (empty($images)) { echo '<p class="col-span-full text-center text-gray-500 mt-8">المعرض فارغ حالياً.</p>'; }
                    else {
                        array_multisort(array_map('filemtime', $images), SORT_DESC, $images);
                        foreach ($images as $image) {
                            $filename = basename($image);
                            ?>
                            <div class="group relative rounded-xl overflow-hidden glass-card shadow-lg">
                                <img src="<?= htmlspecialchars($filename) ?>" alt="صورة المعرض" class="w-full h-48 object-cover">
                                <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div class="flex items-center gap-4">
                                        <!-- Preview Button with Tooltip -->
                                        <div class="has-tooltip">
                                            <span class="tooltip -mt-12 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg">معاينة</span>
                                            <a href="<?= htmlspecialchars($filename) ?>" class="glightbox flex items-center justify-center w-12 h-12 bg-blue-600/80 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110" data-gallery="gallery-main">
                                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </a>
                                        </div>
                                        <!-- Delete Button with Tooltip -->
                                        <div class="has-tooltip">
                                            <span class="tooltip -mt-12 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg">حذف</span>
                                            <button @click="isModalOpen = true; modalFilename = '<?= htmlspecialchars($filename) ?>'" type="button" class="flex items-center justify-center w-12 h-12 bg-red-600/80 hover:bg-red-600 rounded-full transition-all duration-300 transform hover:scale-110">
                                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <?php
                        }
                    }
                    ?>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <div x-show="isModalOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0">
        <div @click.outside="isModalOpen = false" class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center" x-show="isModalOpen" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-90" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-90">
            <h3 class="text-xl font-bold text-white mb-2">تأكيد الحذف</h3><p class="text-gray-400 mb-6">هل أنت متأكد من رغبتك في حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <form method="POST" action="" class="flex justify-center gap-4">
                <input type="hidden" name="filename" x-bind:value="modalFilename">
                <button @click="isModalOpen = false" type="button" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-center text-white bg-gray-600 rounded-lg hover:bg-gray-700">إلغاء</button>
                <button type="submit" name="delete_image" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-center text-white bg-red-600 rounded-lg hover:bg-red-700">نعم, احذف</button>
            </form>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>
    <script>
        const lightbox = GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true, rtl: true, closeButton: true });
        const dropZone = document.getElementById('drop-zone');
        if(dropZone) {
            const fileInput = document.getElementById('image-files'), fileListWrapper = document.getElementById('file-list-wrapper'), fileList = document.getElementById('file-list');
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
            dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
            dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); fileInput.files = e.dataTransfer.files; updateFileList(); });
            fileInput.addEventListener('change', updateFileList);
            function updateFileList() {
                fileList.innerHTML = '';
                if (fileInput.files.length > 0) {
                    fileListWrapper.classList.remove('hidden');
                    const list = document.createElement('ul');
                    list.className = 'list-disc pl-5 text-gray-300 space-y-1';
                    for (const file of fileInput.files) { const listItem = document.createElement('li'); listItem.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`; list.appendChild(listItem); }
                    fileList.appendChild(list);
                } else {
                    fileListWrapper.classList.add('hidden');
                }
            }
        }
    </script>
<?php endif; ?>
</body>
</html>