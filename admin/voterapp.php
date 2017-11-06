<?php
/**
 * Admin bootstrap file for Voterapp2 Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
defined('_JEXEC') or die('Restricted access');

// including debugger -- remove me
jimport('kint.kint');

// Uzer -- our cheap and dirty backend ACL enforcer
jimport('uzer.Uzer');
Uzer::blok(JFactory::getUser(), 'Administrator');

// Instantiate any language files if any
$language = JFactory::getLanguage();
$language->load(JRequest::getCmd('option'), JPATH_SITE);

// Require the base controller
require_once JPATH_COMPONENT . DS . 'controller.php';

// Require specific controller if requested
if ($controller = JRequest::getWord('controller', 'items')) {
    $path = JPATH_COMPONENT . DS . 'controllers' . DS . $controller . '.php';
    if (file_exists($path)) {
        require_once $path;
    } else {
        $controller = '';
    }
}

// Create the controller
$classname = 'Voterapp2Controller' . ucfirst($controller);

$controller = new $classname();

// Perform the Request task
$controller->execute(JRequest::getVar('task'));

// Redirect if set by the controller
$controller->redirect();
