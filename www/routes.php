<?php 

    $app->get('/', function ($request, $response, $args) {
        return $this->view->render($response, 'index.html');
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
.La serie de reproductores que marcó una era en la compañía sólo tendrá al modelo Touch como su único representante, disponible en 32 y 128 GB. El iPod shuffle llegó a comienzos de 2005 y desde 2010 , cuando recuperó sus controles táctiles, no hubo más novedades importantes. Sin dudas, la despedida de dos dispositivos entrañables.";
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
        $mail->Subject   = $subject;
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

    // secciones offline
    $app->get('/{slug}', function ($request, $response, $args) {

        $tpl = str_replace('.','/',$args['slug']);

        if(file_exists(__DIR__ . '/templates/' . $tpl . '.html')){
            return $this->view->render($response, $tpl . '.html',[
                'params' => $request->getQueryParams()
            ]);
        }

        return $this->view->render($response, '404.html');
    });

    // secciones online
    $app->get('/{key}/{slug}', function ($request, $response, $args) {

        $tpl = str_replace('.','/',$args['slug']);

        if(file_exists(__DIR__ . '/templates/' . $tpl . '.html')){
            return $this->view->render($response, $tpl . '.html',[
                'key' => $args['key'],
                'params' => $request->getQueryParams()
            ]);
        }

        return $this->view->render($response, '404.html');
    });    