<?php
require_once __DIR__ . '/../../src/auth.php';
admin_logout();
redirect('admin/login.php');