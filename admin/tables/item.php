<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item Table for Voterapp Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class TableItem extends JTable
{
    public $id;
    public $field;
    public $published;
    public $checked_out;
    public $checked_out_time;
    public $created;
    public $updated;

    /**
     * Define our table, index.
     *
     * @param [type] &$_db [description]
     */
    public function __construct(&$_db)
    {
        parent::__construct('#__voterapp', 'id', $_db);
    }

    /**
     * Validate before saving.
     *
     * @return boolean
     */
    public function check()
    {
        $error = 0;

        // we need something for field
        if (! $this->field) {
            $this->setError(JText::_('VALIDATION FIELD REQUIRED'));
            $error++;
        }

        if ($error) {
            return false;
        }

        return true;
    }
}
