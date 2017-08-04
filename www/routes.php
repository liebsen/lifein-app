<?php 

    $app->get('/', function ($request, $response, $args) {
        return $this->view->render($response, 'index.html');
    });

    $app->post('/spotify_token', function ($request, $response, $args) {
        
        $url = 'https://accounts.spotify.com/api/token';
        
        if($_SERVER['REMOTE_ADDR']=='127.0.0.1'){
            $spot_api_redirect = 'http://LifeIn.local/callback';
        } else {
            $spot_api_redirect = 'https://LifeIn.herokuapp.com/callback';
        }

        $credentials = "a8f4147504384786a9807f6556cfa6aa:b49df9f43d6c4bfba329df4cfa3aa6d6";

        $headers = array(
                "Accept: */*",
                "Content-Type: application/x-www-form-urlencoded",
                "User-Agent: runscope/0.1",
                "Authorization: Basic " . base64_encode($credentials));

        //$data = 'grant_type=authorization_code&code='.$_GET['code'].'&redirect_uri='.urlencode($spot_api_redirect);
        $data = 'grant_type=client_credentials&redirect_uri='.urlencode($spot_api_redirect);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $json = curl_exec($ch);
        curl_close($ch);
        
        return $response->withStatus(200)
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($json));
    });

    function randomKey($length=24) {
        $pool = array_merge(range(0,9), range('a', 'z'),range('A', 'Z'));
        $key = "";
        for($i=0; $i < $length; $i++) {
            $key.= $pool[mt_rand(0, count($pool) - 1)];
        }
        return strtolower($key);
    }

    function verify_nonce($body){

        $filename = __DIR__ . '/../nonces/' . $body['id'];
        $lifespan = 30; // seconds
        $salt = '$';
        $now = time();

        if( ! file_exists($filename)){
            return false;
        }

        $timestamp = (int) file_get_contents($filename);

        unlink($filename);

        $valid = $timestamp + $lifespan;

        if($now > $valid){
            echo "expirado\n";
            return false;
        }

        $nonce = md5($body['id'] . $salt . $timestamp);
        $hash = $body['nonce'];

        return $nonce === $hash;
    }


    $app->get('/nonce', function ($request, $response, $args) {
        
        $id = randomKey();
        $path = __DIR__ . '/../nonces/';
        $now = time();

        while(file_exists($path . $id)){
            $id = randomKey();
        }

        $fp = fopen($path . $id,"wb");
        fwrite($fp,$now);
        fclose($fp);

        $data = ['id' => $id, 'timestamp' => $now];

        return $response->withStatus(200)
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($data));
    });

    $app->get('/template', function ($request, $response, $args) {

        $template = $template?:'message.html';

        $view = new \Slim\Views\Twig( 'templates', [
            'cache' => false
        ]);

        $body['currentyear'] = date('Y');        
        $body['title'] = "hey a New Title Here";
        $body['content'] = "Apple dice adiós a los iPod nano y iPod shuffle
La serie de reproductores que marcó una era en la compañía sólo tendrá al modelo Touch como su único representante, disponible en 32 y 128 GB
VIERNES 28 DE JULIO DE 2017 • 00:30
Click Aqui
De la línea iPod Apple deja de fabricar los modelos Nano y Shuffle y sólo mantendrá la versión Touch
De la línea iPod Apple deja de fabricar los modelos Nano y Shuffle y sólo mantendrá la versión Touch. Foto: EFE 
17

El iPod fue el producto que revivió a Apple , un reproductor de música que consiguió masificar su logo en todo el mundo. Es momento de decir adiós a dos de sus exponentes: el iPod nano y el iPod shuffle dejaron de estar disponibles.


La despedida de los iPod nano y iPod touch se suma a la del Classic, ocurrida en 2014.

Estamos simplificando nuestra familia iPod con dos modelos de iPod touch, ahora con el doble de capacidad a un precio inicial de u$s199, y estamos discontinuando los iPod nano y iPod shuffle, dijo Apple tras ser consultado por el sitio The Verge.


Los nuevos iPod touch vienen en 32 y 128 GB, con un precio este último de u$s299. Las versiones anteriores de 16 y 64 GB tampoco están más disponibles.

Apple, la culpable

El iPod Nano durante la presentación del dispositivo en 2012
El iPod Nano durante la presentación del dispositivo en 2012. Foto: Reuters 
En un mundo sin iPhone, la existencia de los iPod tenía sentido. Pero la calidad de sonido, las funciones y el espacio de almacenamiento que fue adquiriendo el celular de Apple, hicieron que tuviera poco sentido tener un reproductor de música.

El único sobreviviente es el modelo touch, que cuenta con conexión a internet, una cámara sobresaliente y, obviamente, acceso a aplicaciones.

Una vez que se termine el stock de iPod nano y iPod shuffle, Apple no repondrá esos reproductores, convertidos en objeto de deseo durante años.

El iPod Nano en 2010, cuando tenía un diseño compacto y rectangular
El iPod Nano en 2010, cuando tenía un diseño compacto y rectangular. Foto: AFP 
El primer iPod nano fue presentado en 2005 y tuvo su última actualización en 2012, cuando sumó Bluetooth para poder funcionar a la par de auriculares y parlantes inalámbricos. En 2015 estuvo disponible en más colores y después nada más se supo.

El iPod shuffle llegó a comienzos de 2005 y desde 2010 , cuando recuperó sus controles táctiles, no hubo más novedades importantes.

Sin dudas, la despedida de dos dispositivos entrañables.";
        $content = $view->fetch('emails/' . $template,$body);

        echo $content;

        exit;

    });

    $app->get('/sharer', function ($request, $response, $args) {

        global $container;

        $body = $request->getParams();
        extract($body);

        $data = [];

        if(empty($email_to) OR empty($title) OR empty($content) ){
            $data['status'] = "error";
            $data['message'] = "Parámetros insuficientes";
        }

        /* todo -- migrar sistema a otra host que no sea tan fantasma como heroku

        if( ! verify_nonce($body)){
            $data['status'] = "error";
            $data['message'] = "Nonce no válido";
            
            return $response->withStatus(200)
                ->withHeader("Content-Type", "application/json")
                ->write(json_encode($data));
        }
        */

        if($data['status'] == "error"){
            return $response->withStatus(200)
                ->withHeader("Content-Type", "application/json")
                ->write(json_encode($data));            
        }

        $template = $template?:'message.html';

        $view = new \Slim\Views\Twig( 'templates', [
            'cache' => false
        ]);

        $body['currentyear'] = date('Y');
        $body['api_url'] = $container->request->getUri()->getScheme() . '://' . $container->request->getUri()->getHost();
        $content = $view->fetch('emails/' . $template,$body);

    	$mail = new PHPMailer;
    	$mail->isSMTP(); 
        $mail->SMTPDebug = getenv('MAIL_SMTP_DEBUG');
    	$mail->Host = getenv('MAIL_SMTP_HOST');
    	$mail->SMTPAuth = getenv('MAIL_SMTP_AUTH');    
        $mail->Username = getenv('MAIL_SMTP_ACCOUNT');
        $mail->Password = getenv('MAIL_SMTP_PASSWORD');
        $mail->CharSet = "utf8mb4";
        $mail->IsHTML(true);    
    	$mail->SMTPSecure = getenv('MAIL_SMTP_SECURE');
    	$mail->Port = getenv('MAIL_SMTP_PORT');
    	$mail->setFrom($email_from?:getenv('MAIL_FROM'), $name_from?:getenv('MAIL_FROM_NAME'));
        $mail->Subject   = $title;
    	$mail->Body    = $content;
    	$mail->AltBody = $content;
    	
        $mail->addAddress($email_to, $name_to);     // Add a recipient


    	if(!$mail->send()) {
            $data['status'] = "error";
    	    $data['message'] = $mail->ErrorInfo;
    	} else {
            $data['status'] = "success";
    	}	

        return $response->withStatus(200)
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($data));
    });

    $app->get('/{slug}', function ($request, $response, $args) {

        $tpl = str_replace('.','/',$args['slug']);

        if(file_exists(__DIR__ . '/templates/' . $tpl . '.html')){
            return $this->view->render($response, $tpl . '.html',[
                'params' => $request->getQueryParams()
            ]);
        }

        return $this->view->render($response, '404.html');
    });