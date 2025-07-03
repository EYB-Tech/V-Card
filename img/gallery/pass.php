<?php
// ضع كلمة المرور التي تريدها هنا
$my_password = 'eCidGeNdiAlFINGISC';

// توليد هاش آمن
$hash = password_hash($my_password, PASSWORD_DEFAULT);

// طباعة الهاش لنسخه
echo "Your secure password hash is:<br><br>";
echo "<textarea rows='3' cols='70' readonly>" . htmlspecialchars($hash) . "</textarea>";
?>