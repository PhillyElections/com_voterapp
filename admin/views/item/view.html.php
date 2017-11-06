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
     * display method of Item view.
     *
     * @param null|mixed $tpl
     *
     * @return void
     **/
    public function display($tpl = null)
    {
        $item = &$this->get('Data');

        $isNew = ($item->id < 1);

        $text = $isNew ? JText::_('New') : JText::_('Edit');
        JToolBarHelper::title(JText::_('Item') . ': <small><small>[ ' . $text . ' ]</small></small>');
        if ($isNew) {
            JToolBarHelper::save('save', 'Register');
            JToolBarHelper::cancel('cancel', 'Close');
            // We'll use a separate template for new items: default_add
            // $tpl = 'add';
        } else {
            // for existing items the button is renamed `close`
            JToolBarHelper::save('save', 'Update');
            JToolBarHelper::cancel('cancel', 'Close');
        }

        $this->assignRef('item', $item);
        $this->assignRef('isNew', $isNew);

        parent::display($tpl);
    }
}
