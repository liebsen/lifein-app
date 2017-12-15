# LifeIn Admin

![Lifein](https://lifein-app.herokuapp.com/images/LifeIn-White.png)

This is the administration of LifeIn project.

## Install

Install [composer](https://getcomposer.org/) or type

``` bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

## Run composer

``` bash
composer install
```

### Set up the web app config file and point to the api endpoints

```
nano .env
```

## Build

### Build the project

``` bash
php dist.php
```

### Set permissions to logs folder

``` bash
chmod -R 777 logs
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.