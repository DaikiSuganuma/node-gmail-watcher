<?php
$stdin = file_get_contents('php://stdin');
//var_dump($stdin);
dlog($stdin);

$data = json_decode($stdin);

//var_dump($data);
dlog($data);

exit(0);


/**
 * Debug function
 */
function dlog() {
  if (!class_exists('dBug')) {
    require_once ('dBug.php');
  }

  // buffering
  ob_start();
  foreach (func_get_args() as $v) new dBug($v);
  $html = ob_get_contents();
  ob_end_clean();

  // write down to html file.
  $html .= '<br/><br/>';
  $file = './test/debug.html';
  if ($handle = fopen($file, 'a')) {
    @chmod($file, 0777);
    fwrite($handle, $html);
    fclose($handle);
  }
}
