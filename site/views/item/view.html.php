<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item View for Voterapp Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class VoterappViewItem extends JView
{
    /**
     * Item view display method.
     *
     * @param null|mixed $tpl
     *
     * @return void
     **/
    public function display($tpl = null)
    {
        $item = &$this->get('Data');

        $isNew = ($item->id < 1);

        if ($isNew) {
            $tpl = 'add';
        }
        $this->assignRef('item', $item);
        $this->assignRef('isNew', $isNew);

        parent::display($tpl);
    }
}
