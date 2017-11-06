<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items View for Voterapp2 Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license        GNU/GPL
 */
class Voterapp2ViewMain extends JView
{
    /**
     * Items view display method.
     *
     * @param null|mixed $tpl
     *
     * @return void
     **/
    public function display($tpl = null)
    {
        $items = &$this->get('Data');
        $this->assignRef('items', $items);

        parent::display($tpl);
    }
}
