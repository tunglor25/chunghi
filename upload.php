<?php
header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$folder_name = isset($_POST['folder_name']) ? trim($_POST['folder_name']) : '';
$clear_old = isset($_POST['clear_old']) && $_POST['clear_old'] === 'true';

if (empty($folder_name)) {
    echo json_encode(['success' => false, 'message' => 'Folder name is required.']);
    exit;
}

// Security: Prevent path traversal
$folder_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $folder_name);
$target_dir = "assets/images/" . $folder_name . "/";

// Clear old files if requested
if ($clear_old && is_dir($target_dir)) {
    $files = glob($target_dir . '*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

// Create directory if it doesn't exist
if (!is_dir($target_dir)) {
    if (!mkdir($target_dir, 0777, true)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create directory.']);
        exit;
    }
}

// Determine starting index
$existing_files = glob($target_dir . "Anh*.PNG");
$start_index = 0;

if (!$clear_old && $existing_files !== false) {
    // Find the highest index to append correctly
    foreach ($existing_files as $file) {
        $basename = basename($file, ".PNG");
        $number = (int)str_replace("Anh", "", $basename);
        if ($number > $start_index) {
            $start_index = $number;
        }
    }
}

$uploaded_count = 0;
$total_count = $start_index;

if (isset($_FILES['images']) && is_array($_FILES['images']['tmp_name'])) {
    foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
            $total_count++;
            $new_filename = "Anh" . $total_count . ".PNG";
            $target_file = $target_dir . $new_filename;
            
            // Move and rename the file
            // Note: we are directly saving it as .PNG regardless of the original extension
            // Browsers/HTML can still render standard images even if the extension doesn't perfectly match
            if (move_uploaded_file($tmp_name, $target_file)) {
                $uploaded_count++;
            } else {
                $total_count--; // rollback count if upload failed
            }
        }
    }
}

echo json_encode([
    'success' => true,
    'message' => "Uploaded $uploaded_count files.",
    'folder' => $folder_name,
    'imgCount' => $total_count
]);
?>
