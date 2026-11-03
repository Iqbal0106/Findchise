<?php
require_once __DIR__ . '/_bootstrap.php';

pastikanMetode('POST');
akhiriSesiAdmin();

kirimJson(200, [
    'success' => true,
    'message' => 'Anda telah keluar dari sesi admin.',
]);
